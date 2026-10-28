from pymongo import MongoClient
from app.config import MONGODB_URI

client = None
db = None

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    db = client.get_default_database("docvault")
    # Quick ping to verify connectivity
    client.admin.command('ping')
    print("[MongoDB] Python PyMongo connected successfully to Atlas cluster!")
except Exception as e:
    print(f"[MongoDB] Connection error: {e}")

def get_db():
    return db
