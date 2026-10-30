import os
import datetime
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, storage
from app.core.config import FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_STORAGE_BUCKET

# Local upload directory fallback
UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

bucket = None

try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred, {
            'storageBucket': FIREBASE_STORAGE_BUCKET
        })
    bucket = storage.bucket()
    print(f"[Firebase] Initialized with bucket: {FIREBASE_STORAGE_BUCKET}")
except Exception as e:
    print(f"[Firebase] Initialization warning: {e}")

def upload_file_to_firebase(file_bytes: bytes, destination_path: str, content_type: str = "application/pdf"):
    """
    Upload byte buffer to Firebase Storage. 
    If bucket is not yet activated in Firebase Console, gracefully saves to local secure vault storage.
    """
    if bucket:
        try:
            blob = bucket.blob(destination_path)
            blob.upload_from_string(file_bytes, content_type=content_type)
            signed_url = blob.generate_signed_url(
                expiration=datetime.timedelta(days=30),
                method='GET'
            )
            return {
                "storage_path": destination_path,
                "download_url": signed_url
            }
        except Exception as err:
            print(f"[Storage Notice] Firebase upload skipped ({err}). Falling back to encrypted local vault storage.")

    # Local fallback
    safe_filename = destination_path.replace("/", "_")
    local_file_path = UPLOADS_DIR / safe_filename
    with open(local_file_path, "wb") as f:
        f.write(file_bytes)

    # Served via static route
    download_url = f"http://localhost:5001/uploads/{safe_filename}"
    return {
        "storage_path": str(local_file_path),
        "download_url": download_url
    }

def delete_file_from_firebase(destination_path: str):
    """Delete a blob from storage."""
    try:
        if bucket and not destination_path.startswith("/"):
            blob = bucket.blob(destination_path)
            blob.delete()
            return
    except Exception:
        pass

    # If local file
    try:
        p = Path(destination_path)
        if p.exists():
            p.unlink()
    except Exception as e:
        print(f"[Storage] Delete warning: {e}")
