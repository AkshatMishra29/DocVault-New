import json
from groq import Groq
from app.config import GROQ_API_KEY, GROQ_MODEL

client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print(f"[Groq] Init error: {e}")

def extract_document_metadata(raw_text: str, filename: str) -> dict:
    """Use Groq Llama-3.3 to extract structured entity metadata & expiry date."""
    if not client:
        return {
            "title": filename,
            "category": "Other",
            "summary": "Document stored securely in DocVault.",
            "expiryDate": None,
            "keyDetails": {"File Name": filename},
            "tags": ["Document", "Vault"]
        }

    prompt = f"""You are the DocVault AI Extraction Engine.
Analyze the following document text and return ONLY a valid JSON object (no markdown, no backticks, no commentary).

Extract the following fields:
{{
  "title": "A short, descriptive title for this document (e.g., 'Honda City Comprehensive Insurance Policy')",
  "category": "One of: ['Insurance', 'Appliances', 'Identity', 'Property', 'Medical', 'Other']",
  "summary": "A concise 2-3 sentence executive summary explaining what this document is and any critical policy numbers or conditions.",
  "expiryDate": "YYYY-MM-DD format if an expiration, renewal, or warranty end date is present, otherwise null",
  "keyDetails": {{
    "Key Name (e.g. Policy Number, Sum Insured, Serial Number, Premium)": "Value"
  }},
  "tags": ["array", "of", "3-5", "relevant", "search", "keywords"]
}}

Filename: {filename}
Document Text:
{raw_text[:4000] if raw_text else 'Infer context from filename.'}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"[Groq] Metadata extraction error: {e}")
        return {
            "title": filename,
            "category": "Other",
            "summary": "Document stored securely in DocVault.",
            "expiryDate": None,
            "keyDetails": {"File Name": filename},
            "tags": ["Document", "Vault"]
        }

def answer_document_query(question: str, context_docs: list) -> str:
    """RAG Question Answering over provided documents."""
    if not client:
        return "Groq AI client is not configured."

    context_str = "\n---\n".join([
        f"[Document]: {d.get('title')} (Category: {d.get('category')})\n"
        f"Summary: {d.get('summary')}\n"
        f"Key Details: {d.get('keyDetails')}"
        for d in context_docs
    ])

    prompt = f"""You are the DocVault AI Assistant.
Answer the user's question directly, accurately, and politely using ONLY the provided document context below.
If the documents don't provide the answer, say "I cannot find that in your currently uploaded documents."
Always include specific numbers, dates, and name the source document when answering.

CONTEXT DOCUMENTS:
{context_str}

USER QUESTION:
{question}
"""

    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL,
            temperature=0.2,
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"[Groq] Q&A error: {e}")
        return f"Error querying Vault AI: {e}"
