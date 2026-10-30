# Phase 0 & Phase 22 Audit: DocVault Architecture & System Inventory

## 1. Executive Summary
This document establishes the verified technical baseline of the DocVault application prior to frontend design system rollout and product UI redesign. All functional workflows, authentication contracts, OCR pipelines, database models, and service interfaces are preserved.

---

## 2. Technology Stack & Verification
- **Frontend Stack**:
  - React `19.3.1` (SPA)
  - Vite `8.3.5` (Build system, Rollup engine)
  - React Router DOM `7.18.4` (Client-side routing)
  - Lucide React `1.62.0` (Icon system)
  - Markdown: `react-markdown` (`^10.1.0`) + `remark-gfm` (`^4.0.1`)
  - Target CSS Architecture: Pure CSS Design Tokens, BEM-inspired feature scopes, zero bloated runtime CSS-in-JS.
- **Backend Stack**:
  - Primary Gateway: Node.js (ES Modules, `>=20.0`), Express `5.3.0` on port `5001`.
  - Database & ODM: MongoDB Atlas via Mongoose `9.11.4`.
  - Multimodal Vision & LLM: Groq Cloud SDK (`qwen/qwen3.8-27b`) for document entity extraction and conversational RAG.
  - Semantic Embeddings: Hugging Face Inference API (`BAAI/bge-small-en-v1.5`, 384-dimensional dense vectors).
  - OCR Pipeline: Sharp `0.35.5` image conditioning + Tesseract.js `7.0.0` local optical character recognition + `pdf-parse` `2.4.5`.
  - File Storage: MongoDB binary document storage + Cloudflare R2 / Firebase storage adapter modules.
  - Decoupled Python Service: `python-service/app/main.py` (FastAPI) retained as an independent microservice.

---

## 3. Production Entry Points & Verification Status
- **Backend Entry Point**: `backend/src/server.js` (executes `node src/server.js`), connects to MongoDB Atlas cluster with DNS fallback. Verified working (`/api/health` -> 200 OK).
- **Frontend Entry Point**: `frontend/src/main.jsx` -> mounts `frontend/src/app/App.jsx` with `AppProviders` and `AppRoutes`. Verified working (`npm run build` -> 0 errors).
- **CORS Whitelist**: Whitelists `http://localhost:5173`, `http://localhost:3000`, `http://localhost:5001`, and production domains on Render.
