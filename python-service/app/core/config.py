import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

PORT = int(os.getenv("PORT", "5001"))
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://akshatDB:akshat12345@cluster0.zll6vmi.mongodb.net/docvault?retryWrites=true&w=majority")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY", "")
HF_EMBEDDING_MODEL = os.getenv("HF_EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
FIREBASE_SERVICE_ACCOUNT_PATH = str(BASE_DIR / "firebase-service-account.json")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "docvault-app-f867f.firebasestorage.app")
JWT_SECRET = os.getenv("JWT_SECRET", "docvault_jwt_secret_secure_key_994208")
JWT_ALGORITHM = "HS256"
