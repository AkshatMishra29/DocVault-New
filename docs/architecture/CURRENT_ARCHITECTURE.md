# DocVault Current Architecture & Request Flow

## 1. Modular Monolith Architecture Overview

```text
React 19 SPA (Client) ──► Express.js (Port 5001) ──► MongoDB Atlas Cluster
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
Groq Cloud LPU (Qwen 3.8 27B)            Hugging Face Inference (Embeddings)
```

## 2. Authentication Flow
1. User provides email + password -> `/api/auth/login`.
2. Server validates bcrypt hash -> returns temporary token with `requiresPin: true`.
3. Client navigates to `/enter-pin` -> user enters 4-6 digit numeric PIN.
4. Server verifies PIN hash -> returns standard 7-day session JWT containing `{ userId, email, pinVerified: true }`.
5. Frontend saves token in `localStorage` and injects `Authorization: Bearer <token>` into subsequent API queries via `apiClient.js`.

## 3. Storage & Multi-Tenancy Architecture
- Ingested files have their base64 binary content saved in MongoDB Document records or delegated to Cloudflare R2 / Firebase Storage.
- Direct downloads utilize `/api/documents/:id/download`.
- Strict multi-tenancy ensures every query binds to `req.user.userId`.

