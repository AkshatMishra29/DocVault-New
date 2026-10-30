import time
import json
import datetime
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from bson import ObjectId

from app.core.config import JWT_SECRET, JWT_ALGORITHM, PORT
from app.core.database import get_db
from app.services.firebase_service import upload_file_to_firebase, delete_file_from_firebase
from app.services.groq_service import extract_document_metadata, answer_document_query
from app.services.huggingface_service import generate_embedding

import bcrypt

def sanitize_key_details(details: dict) -> dict:
    """Sanitize keys for MongoDB Map storage.
    Replaces spaces and dots with underscores and ensures all values are strings.
    """
    sanitized = {}
    for k, v in details.items():
        safe_key = k.replace(' ', '_').replace('.', '_')
        sanitized[safe_key] = str(v)
    return sanitized

def hash_secret(secret_str: str) -> str:
    # Truncate to 72 bytes as per bcrypt specification
    secret_bytes = secret_str.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(secret_bytes, salt).decode('utf-8')

def verify_secret(secret_str: str, hashed_str: str) -> bool:
    try:
        secret_bytes = secret_str.encode('utf-8')[:72]
        return bcrypt.checkpw(secret_bytes, hashed_str.encode('utf-8'))
    except Exception:
        return False

from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(title="DocVault Python API", version="2.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for file retrieval
uploads_path = Path(__file__).resolve().parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Helper to serialize Mongo docs

# Dependency to extract current user from JWT
from fastapi import Request, Depends, status
from jose import JWTError

def get_current_user(request: Request = Depends()):
    auth: str = request.headers.get('Authorization')
    if not auth or not auth.startswith('Bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing or invalid Authorization header')
    token = auth.split(' ')[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
def serialize_mongo(doc):
    if not doc:
        return doc
    doc["id"] = str(doc.get("_id"))
    doc.pop("_id", None)
    return doc



def health_check():
    db = get_db()
    mongo_status = "Connected" if db is not None else "Disconnected"
    return {
        "status": "ok",
        "runtime": "Python FastAPI",
        "services": {
            "mongodb": mongo_status,
            "groqApi": True,
            "huggingFaceApi": True,
            "firebaseStorage": True
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# ==============================================================================
# Pydantic Schemas
# ==============================================================================
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    pin: str
    phone: Optional[str] = ""

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class VerifyPinRequest(BaseModel):
    email: EmailStr
    pin: str

class AIQueryRequest(BaseModel):
    question: str
    docId: Optional[str] = None

# ==============================================================================
# 1. Health & Status
# ==============================================================================

@app.get("/api/health")
def health_check():
    db = get_db()
    mongo_status = "Connected" if db is not None else "Disconnected"
    return {
        "status": "ok",
        "runtime": "Python FastAPI",
        "services": {
            "mongodb": mongo_status,
            "groqApi": True,
            "huggingFaceApi": True,
            "firebaseStorage": True
        },
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# ==============================================================================
# 2. Authentication & Vault PIN Flow
# ==============================================================================
@app.post("/api/auth/register", status_code=201)
def register_user(req: RegisterRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    if len(req.pin) < 4 or len(req.pin) > 6:
        raise HTTPException(status_code=400, detail="PIN must be between 4 and 6 digits.")

    existing = db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    password_hash = hash_secret(req.password)
    pin_hash = hash_secret(req.pin)

    new_user = {
        "name": req.name,
        "email": req.email,
        "passwordHash": password_hash,
        "pinHash": pin_hash,
        "pinLength": len(req.pin),
        "phone": req.phone,
        "tier": "Vault Pro (Personal)",
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
    }

    result = db.users.insert_one(new_user)
    token = jwt.encode(
        {"userId": str(result.inserted_id), "email": req.email, "unlocked": True},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "success": True,
        "message": "Vault account created successfully",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "name": req.name,
            "email": req.email,
            "pinLength": len(req.pin),
            "tier": "Vault Pro (Personal)"
        }
    }

@app.post("/api/auth/login")
def login_step_one(req: LoginRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    user = db.users.find_one({"email": req.email})
    password_hash = user.get("passwordHash") or user.get("password_hash")
    if not user or not password_hash or not verify_secret(req.password, password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    pin_session_token = jwt.encode(
        {"userId": str(user["_id"]), "requiresPin": True, "exp": time.time() + 900},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "success": True,
        "requiresPin": True,
        "pinSessionToken": pin_session_token,
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", "User"),
            "email": user["email"],
            "pinLength": user.get("pinLength", 4)
        }
    }

@app.post("/api/auth/verify-pin")
def verify_vault_pin(req: VerifyPinRequest):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database unavailable")

    user = db.users.find_one({"email": req.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    pin_hash = user.get("pinHash") or user.get("pin_hash")
    if not pin_hash or not verify_secret(req.pin, pin_hash):
        raise HTTPException(status_code=401, detail="Incorrect Vault PIN. Please try again.")

    unlocked_token = jwt.encode(
        {"userId": str(user["_id"]), "email": user["email"], "unlocked": True},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )

    return {
        "success": True,
        "message": "Vault unlocked successfully",
        "token": unlocked_token,
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", "User"),
            "email": user["email"],
            "tier": user.get("tier", "Vault Pro (Personal)")
        }
    }

# ==============================================================================
# 3. Documents API
# ==============================================================================
@app.get("/api/documents")
def list_documents(category: Optional[str] = None, q: Optional[str] = None, user: dict = Depends(get_current_user)):
    db = get_db()
    query = {"ownerId": user.get("userId")}
    if category and category != "All":
        query["category"] = category

    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q]}},
            {"summary": {"$regex": q, "$options": "i"}}
        ]

    docs = list(db.documents.find(query).sort("createdAt", -1))
    return {
        "success": True,
        "count": len(docs),
        "data": [serialize_mongo(d) for d in docs]
    }
def list_documents(category: Optional[str] = None, q: Optional[str] = None):
    db = get_db()
    query = {}
    if category and category != "All":
        query["category"] = category

    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"tags": {"$in": [q]}},
            {"summary": {"$regex": q, "$options": "i"}}
        ]

    docs = list(db.documents.find(query).sort("createdAt", -1))
    return {
        "success": True,
        "count": len(docs),
        "data": [serialize_mongo(d) for d in docs]
    }

@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    try:
        doc = db.documents.find_one({"_id": ObjectId(doc_id), "ownerId": user.get("userId")})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"success": True, "data": serialize_mongo(doc)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID")
def get_document(doc_id: str):
    db = get_db()
    try:
        doc = db.documents.find_one({"_id": ObjectId(doc_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"success": True, "data": serialize_mongo(doc)}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Document ID")

@app.post("/api/documents/upload", status_code=201)
async def upload_document(file: UploadFile = File(...), category: Optional[str] = Form("Other"), user: dict = Depends(get_current_user)):
    db = get_db()
    content_bytes = await file.read()
    original_name = file.filename
    mimetype = file.content_type or "application/pdf"
    size_bytes = len(content_bytes)
    size_formatted = f"{(size_bytes / (1024 * 1024)):.1f} MB"

    # 1. Upload to Firebase Storage
    destination_path = f"documents/{int(time.time())}_{original_name}"
    storage_res = upload_file_to_firebase(content_bytes, destination_path, mimetype)

    # Extract real text from PDF or Image if available
    extracted_text = ""
    if "pdf" in mimetype.lower():
        try:
            import io
            from pypdf import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content_bytes))
            for page in pdf_reader.pages[:5]: # Extract first 5 pages max
                txt = page.extract_text()
                if txt:
                    extracted_text += txt + "\n"
        except Exception as e:
            print(f"[PDF Extract Warning]: {e}")
    elif any(img_ext in mimetype.lower() for img_ext in ["image", "jpeg", "jpg", "png", "webp"]):
        try:
            import io
            from PIL import Image
            import pytesseract
            img = Image.open(io.BytesIO(content_bytes))
            ocr_text = pytesseract.image_to_string(img)
            if ocr_text:
                extracted_text = ocr_text.strip()
                print(f"[OCR Success]: Extracted {len(extracted_text)} characters from {original_name}")
        except Exception as e:
            print(f"[Image OCR Warning]: {e}")

    # 2. Extract Metadata via Groq
    metadata = extract_document_metadata(extracted_text, original_name)

    # 3. Generate Vector Embedding via Hugging Face
    text_to_embed = f"{metadata.get('title')} {metadata.get('summary')} {' '.join(metadata.get('tags', []))}"
    embedding = generate_embedding(text_to_embed)

    # 4. Save to MongoDB with ownerId
    doc_record = {
        "title": metadata.get("title") or original_name,
        "originalName": original_name,
        "category": metadata.get("category") or category,
        "format": "PDF" if "pdf" in mimetype.lower() else "Image",
        "sizeBytes": size_bytes,
        "fileSizeFormatted": size_formatted,
        "storagePath": storage_res["storage_path"],
        "downloadUrl": storage_res["download_url"],
        "summary": metadata.get("summary"),
        "keyDetails": sanitize_key_details(metadata.get('keyDetails', {})),
        "tags": metadata.get("tags", []),
        "expiryDate": metadata.get("expiryDate"),
        "isExpiringSoon": bool(metadata.get("expiryDate")),
        "embedding": embedding,
        "ownerId": user.get("userId"),
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
    }

    insert_res = db.documents.insert_one(doc_record)
    doc_record["id"] = str(insert_res.inserted_id)

    # If expiry detected, create reminder deadline
    if metadata.get("expiryDate"):
        try:
            exp_date = datetime.date.fromisoformat(metadata["expiryDate"]) 
            days_left = (exp_date - datetime.date.today()).days
            db.deadlines.insert_one({
                "title": f"{doc_record['title']} Expiry",
                "date": metadata["expiryDate"],
                "daysLeft": max(days_left, 0),
                "severity": "urgent" if days_left < 30 else "upcoming",
                "linkedDocId": insert_res.inserted_id,
                "action": "Review / Renew Policy",
                "createdAt": datetime.datetime.now(datetime.timezone.utc)
            })
        except Exception as e:
            print(f"[Deadline] Expiry parse error: {e}")

    return {"success": True, "data": serialize_mongo(doc_record)}
async def upload_document(file: UploadFile = File(...), category: Optional[str] = Form("Other")):
    db = get_db()
    content_bytes = await file.read()
    original_name = file.filename
    mimetype = file.content_type or "application/pdf"
    size_bytes = len(content_bytes)
    size_formatted = f"{(size_bytes / (1024 * 1024)):.1f} MB"

    # 1. Upload to Firebase Storage
    destination_path = f"documents/{int(time.time())}_{original_name}"
    storage_res = upload_file_to_firebase(content_bytes, destination_path, mimetype)

    # Extract real text from PDF or Image if available
    extracted_text = ""
    if "pdf" in mimetype.lower():
        try:
            import io
            from pypdf import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content_bytes))
            for page in pdf_reader.pages[:5]: # Extract first 5 pages max
                txt = page.extract_text()
                if txt:
                    extracted_text += txt + "\n"
        except Exception as e:
            print(f"[PDF Extract Warning]: {e}")
    elif any(img_ext in mimetype.lower() for img_ext in ["image", "jpeg", "jpg", "png", "webp"]):
        try:
            import io
            from PIL import Image
            import pytesseract
            img = Image.open(io.BytesIO(content_bytes))
            ocr_text = pytesseract.image_to_string(img)
            if ocr_text:
                extracted_text = ocr_text.strip()
                print(f"[OCR Success]: Extracted {len(extracted_text)} characters from {original_name}")
        except Exception as e:
            print(f"[Image OCR Warning]: {e}")


    # 2. Extract Metadata via Groq
    metadata = extract_document_metadata(extracted_text, original_name)

    # 3. Generate Vector Embedding via Hugging Face
    text_to_embed = f"{metadata.get('title')} {metadata.get('summary')} {' '.join(metadata.get('tags', []))}"
    embedding = generate_embedding(text_to_embed)

    # 4. Save to MongoDB
    doc_record = {
        "title": metadata.get("title") or original_name,
        "originalName": original_name,
        "category": metadata.get("category") or category,
        "format": "PDF" if "pdf" in mimetype.lower() else "Image",
        "sizeBytes": size_bytes,
        "fileSizeFormatted": size_formatted,
        "storagePath": storage_res["storage_path"],
        "downloadUrl": storage_res["download_url"],
        "summary": metadata.get("summary"),
        "keyDetails": sanitize_key_details(metadata.get('keyDetails', {})),
        "tags": metadata.get("tags", []),
        "expiryDate": metadata.get("expiryDate"),
        "isExpiringSoon": bool(metadata.get("expiryDate")),
        "embedding": embedding,
        "createdAt": datetime.datetime.now(datetime.timezone.utc)
    }

    insert_res = db.documents.insert_one(doc_record)
    doc_record["id"] = str(insert_res.inserted_id)

    # If expiry detected, create reminder deadline
    if metadata.get("expiryDate"):
        try:
            exp_date = datetime.date.fromisoformat(metadata["expiryDate"])
            days_left = (exp_date - datetime.date.today()).days
            db.deadlines.insert_one({
                "title": f"{doc_record['title']} Expiry",
                "date": metadata["expiryDate"],
                "daysLeft": max(days_left, 0),
                "severity": "urgent" if days_left < 30 else "upcoming",
                "linkedDocId": insert_res.inserted_id,
                "action": "Review / Renew Policy",
                "createdAt": datetime.datetime.now(datetime.timezone.utc)
            })
        except Exception as e:
            print(f"[Deadline] Expiry parse error: {e}")

    return {"success": True, "data": serialize_mongo(doc_record)}

@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    db = get_db()
    try:
        obj_id = ObjectId(doc_id)
        doc = db.documents.find_one({"_id": obj_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        delete_file_from_firebase(doc["storagePath"])
        db.documents.delete_one({"_id": obj_id})
        db.deadlines.delete_many({"linkedDocId": obj_id})

        return {"success": True, "message": "Document deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/api/documents/{doc_id}")
def update_document(doc_id: str, updates: dict):
    db = get_db()
    try:
        obj_id = ObjectId(doc_id)
        # Prevent mutating sensitive internal fields
        updates.pop("_id", None)
        updates.pop("id", None)
        updates.pop("storagePath", None)
        updates.pop("downloadUrl", None)

        res = db.documents.find_one_and_update(
            {"_id": obj_id},
            {"$set": updates},
            return_document=True
        )
        if not res:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"success": True, "data": serialize_mongo(res)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# 4. AI Query (Groq + RAG)
# ==============================================================================
# 4. AI Query (Groq + RAG)
@app.post("/api/ai/query")
def ask_vault_ai(req: AIQueryRequest, user: dict = Depends(get_current_user)):
    db = get_db()
    context_docs = []

    if req.docId:
        try:
            d = db.documents.find_one({"_id": ObjectId(req.docId), "ownerId": user.get("userId")})
            if d:
                context_docs = [d]
        except Exception:
            pass
    else:
        context_docs = list(db.documents.find({"ownerId": user.get("userId")}).limit(5))

    answer = answer_document_query(req.question, context_docs)

    return {
        "success": True,
        "answer": answer,
        "sources": [{"title": d.get("title"), "category": d.get("category")} for d in context_docs]
    }
def ask_vault_ai(req: AIQueryRequest):
    db = get_db()
    context_docs = []

    if req.docId:
        try:
            d = db.documents.find_one({"_id": ObjectId(req.docId)})
            if d:
                context_docs = [d]
        except Exception:
            pass
    else:
        context_docs = list(db.documents.find().limit(5))

    answer = answer_document_query(req.question, context_docs)

    return {
        "success": True,
        "answer": answer,
        "sources": [{"title": d.get("title"), "category": d.get("category")} for d in context_docs]
    }

# ==============================================================================
# 5. Assets & Deadlines APIs
# ==============================================================================
@app.get("/api/assets")
def get_assets():
    db = get_db()
    assets = list(db.assets.find().sort("createdAt", -1))
    return {"success": True, "data": [serialize_mongo(a) for a in assets]}

@app.post("/api/assets", status_code=201)
def create_asset(payload: dict):
    db = get_db()
    payload["createdAt"] = datetime.datetime.now(datetime.timezone.utc)
    if "linkedDocIds" not in payload:
        payload["linkedDocIds"] = []
    res = db.assets.insert_one(payload)
    payload["id"] = str(res.inserted_id)
    return {"success": True, "data": serialize_mongo(payload)}

@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: str):
    db = get_db()
    try:
        obj_id = ObjectId(asset_id)
        res = db.assets.delete_one({"_id": obj_id})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"success": True, "message": "Asset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/deadlines")
def get_deadlines():
    db = get_db()
    today = datetime.date.today()
    deadlines = []

    # 1. Fetch deadlines from documents with expiryDate
    docs = list(db.documents.find({"expiryDate": {"$ne": None}}))
    for d in docs:
        exp_str = str(d.get("expiryDate", ""))
        try:
            exp_date = datetime.date.fromisoformat(exp_str[:10])
            days_left = (exp_date - today).days
            severity = "urgent" if days_left <= 15 else "upcoming"
            deadlines.append({
                "id": f"doc_{d['_id']}",
                "title": f"{d.get('title')} Renewal",
                "date": exp_str[:10],
                "daysLeft": max(days_left, 0),
                "severity": severity,
                "action": f"Review {d.get('category')} terms",
                "linkedDocId": str(d["_id"]),
                "sourceType": "document"
            })
        except Exception:
            pass

    # 2. Fetch deadlines from assets (insurance, warranty, service)
    assets = list(db.assets.find())
    for a in assets:
        for field, label, action_text in [
            ("insuranceExpiry", "Insurance Expiry", "Renew vehicle/asset insurance"),
            ("warrantyExpiry", "Warranty Expiry", "Check extended warranty coverage"),
            ("nextService", "Scheduled Service", "Book authorized service appointment")
        ]:
            val = a.get(field)
            if val:
                try:
                    exp_date = datetime.date.fromisoformat(str(val)[:10])
                    days_left = (exp_date - today).days
                    severity = "urgent" if days_left <= 15 else "upcoming"
                    deadlines.append({
                        "id": f"asset_{a['_id']}_{field}",
                        "title": f"{a.get('name')} {label}",
                        "date": str(val)[:10],
                        "daysLeft": max(days_left, 0),
                        "severity": severity,
                        "action": action_text,
                        "linkedAssetId": str(a["_id"]),
                        "sourceType": "asset"
                    })
                except Exception:
                    pass

    # Sort deadlines by days remaining
    deadlines.sort(key=lambda x: x["daysLeft"])
    return {"success": True, "data": deadlines}

@app.get("/api/deadlines/calendar.ics")
def export_calendar_ics():
    """Generates standard iCalendar (.ics) format for Google/Apple Calendar sync."""
    data = get_deadlines()["data"]
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//DocVault//Document Reminders//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]

    for item in data:
        clean_date = item["date"].replace("-", "")
        uid = f"{item['id']}@docvault.app"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART;VALUE=DATE:{clean_date}",
            f"SUMMARY:DocVault Reminder: {item['title']}",
            f"DESCRIPTION:{item['action']}. Days Left: {item['daysLeft']}",
            "STATUS:CONFIRMED",
            "END:VEVENT"
        ])

    lines.append("END:VCALENDAR")
    ics_content = "\r\n".join(lines)
    return Response(content=ics_content, media_type="text/calendar", headers={
        "Content-Disposition": "attachment; filename=docvault-reminders.ics"
    })

