# DocVault API Inventory & Contract Specification

| Method | Endpoint | Purpose | Request Payload | Response Schema |
|:---|:---|:---|:---|:---|
| `GET` | `/api/health` | Service health status | None | `{ status: "ok", services: { mongodb, groqApi, huggingFaceApi, storage } }` |
| `POST` | `/api/auth/register` | Account registration | `{ name, email, password, pin, phone }` | `{ success: true, user: { id, name, email, tier }, token }` |
| `POST` | `/api/auth/login` | Step 1 credential auth | `{ email, password }` | `{ success: true, user, token, requiresPin: true }` |
| `POST` | `/api/auth/verify-pin` | Step 2 PIN verification | `{ email, pin }` | `{ success: true, user, token }` |
| `GET` | `/api/documents` | List user documents | Query: `?category=...&q=...` | `{ success: true, count, data: Document[] }` |
| `GET` | `/api/documents/:id` | Document metadata | None | `{ success: true, data: Document }` |
| `POST` | `/api/documents/upload` | Multipart file upload | `FormData: file` | `{ success: true, message, data: Document }` |
| `GET` | `/api/documents/:id/download` | Binary stream | Query: `?token=...` (optional) | Binary stream (`inline; filename=...`) |
| `PATCH` | `/api/documents/:id` | Update document fields | `{ title, category, tags, keyDetails, isFavorite, assetId }` | `{ success: true, data: Document }` |
| `DELETE` | `/api/documents/:id` | Purge document & alerts | None | `{ success: true, message }` |
| `GET` | `/api/assets` | List user assets | None | `{ success: true, data: Asset[] }` |
| `POST` | `/api/assets` | Create asset | `{ name, category, estimatedValue, purchaseDate, warrantyExpiry, ... }` | `{ success: true, data: Asset }` |
| `DELETE` | `/api/assets/:id` | Remove asset | None | `{ success: true, message }` |
| `GET` | `/api/deadlines` | List deadlines | None | `{ success: true, data: Deadline[] }` |
| `GET` | `/api/deadlines/calendar.ics` | Download iCalendar | Query: `?token=...` (optional) | Text/calendar stream (`docvault-deadlines.ics`) |
| `POST` | `/api/ai/query` | Ask AI over vault | `{ question, docId? }` | `{ success: true, data: { answer, confidence, referencedDocIds, actionItem } }` |
| `GET` | `/api/vault/export` | Full vault backup | None | JSON file download (`docvault-backup-<timestamp>.json`) |
| `GET` | `/api/vault/audit-trail` | Security audit trail | None | `{ success: true, count, data: AuditLog[] }` |
