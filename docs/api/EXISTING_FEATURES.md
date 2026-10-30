# Existing Features Inventory

The following features are actively implemented, verified, and strictly protected during UI modernization:

1. **User Authentication & Vault PIN Flow**
   - User Registration (`name`, `email`, `password`, `pin`, optional `phone`).
   - User Login (`email`, `password` -> returns token requiring PIN).
   - Vault PIN Unlock (Numeric keypad + physical keyboard/numpad listener -> issues full `7d` JWT session).
   - Strict multi-tenant data isolation on all authenticated queries via `userId`.

2. **Smart Ingestion & Hybrid OCR**
   - Multipart document upload handling PDFs, PNGs, JPGs, WEBP up to 25 MB.
   - Text extraction via `pdf-parse` for digital PDFs.
   - Scanned PDF rendering via `pdf-img-convert`.
   - Sharp-conditioned local OCR via `tesseract.js`.
   - Multimodal fallback via Groq Vision (`qwen/qwen3.8-27b`) for degraded documents.
   - Groq AI entity extraction: auto-detects `title`, `category`, `summary`, `expiryDate`, and key-value properties.

3. **Document Management & Viewing**
   - Category filtering (`Insurance`, `Identity`, `Appliances`, `Property`, `Medical`, `Other`).
   - Keyword search across title, summary, and tags.
   - Detailed document inspection with keyDetails, download, metadata editing (`PATCH`), and deletion.

4. **Asset Management & Warranty Tracking**
   - Asset registry (`Vehicle`, `Home Appliances`, `Electronics`, `Real Estate`).
   - Bi-directional linking between assets and documents.
   - Purchase date, warranty expiry, insurance expiry, and service dates.

5. **Renewal Deadlines & Calendar Sync**
   - Chronological deadline cards with days-left countdown and severity tagging.
   - Dynamic iCalendar (`.ics`) RFC-5545 feed generation for Google, Apple, and Outlook calendars.

6. **Bounded RAG Copilot (Ask AI)**
   - Conversational AI strictly constrained to authenticated user documents.
   - Cosine similarity ranking using Hugging Face 384-dimensional dense vector embeddings.
   - Formatted Markdown responses with source document citations.

7. **Vault Security & Governance**
   - Tamper-evident user audit trail (`VIEW`, `DOWNLOAD`, `UPLOAD`, `DELETE`).
   - Complete vault backup export as portable JSON archive.

