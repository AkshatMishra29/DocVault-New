import requests
from app.config import HUGGINGFACE_API_KEY, HF_EMBEDDING_MODEL

API_URL = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{HF_EMBEDDING_MODEL}"
headers = {"Authorization": f"Bearer {HUGGINGFACE_API_KEY}"}

def generate_embedding(text: str) -> list:
    """Generate 384-dimensional vector embeddings via Hugging Face Inference API."""
    if not HUGGINGFACE_API_KEY:
        return []
    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": text[:1000]},
            timeout=10
        )
        if response.status_code == 200:
            res_json = response.json()
            if isinstance(res_json, list):
                return res_json
        else:
            print(f"[HuggingFace] Warning ({response.status_code}): {response.text}")
    except Exception as e:
        print(f"[HuggingFace] Error: {e}")
    return []
