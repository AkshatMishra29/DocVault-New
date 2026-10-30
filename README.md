<div align="center">

# 🛡️ DocVault
### Privacy-First Intelligent Personal Document Custodian & Bounded RAG Copilot

[![Architecture: Modular Monolith](https://img.shields.io/badge/Architecture-Modular_Monolith-blue.svg?style=for-the-badge)](https://github.com/AkshatMishra29/DocVault-New)
[![Frontend: React 19 + Vite](https://img.shields.io/badge/Frontend-React_19_%2B_Vite-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend: Node.js + Express 5](https://img.shields.io/badge/Backend-Node.js_%2B_Express_5-339933.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Database: MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/atlas)
[![AI Engine: Groq LPU](https://img.shields.io/badge/AI_Engine-Groq_Qwen3.8--27B-F55036.svg?style=for-the-badge)](https://groq.com/)
[![OCR Engine: Sharp + Tesseract.js](https://img.shields.io/badge/OCR-Sharp_%2B_Tesseract.js-5C2D91.svg?style=for-the-badge)](https://tesseract.projectnaptha.com/)
[![Security: 2FA & Strict Isolation](https://img.shields.io/badge/Security-2FA_PIN_%2B_Zero_Leakage-crimson.svg?style=for-the-badge)](https://jwt.io/)

<p align="center">
  <b>DocVault</b> transforms scattered personal policies, receipts, vehicle registrations, and government IDs into an encrypted, structured, searchable knowledge vault with automated expiry tracking and an air-tight AI assistant.
</p>

[Key Features](#-key-features--workflows) •
[Architecture](#-system-architecture) •
[Directory Tree](#-modular-directory-structure) •
[API Reference](#-api-reference) •
[Getting Started](#-local-setup--quickstart) •
[Security Model](#-security--isolation-architecture)

---

</div>

## 📌 Executive Overview

### The Problem
Managing physical and digital documents across households and enterprises is plagued by three fundamental challenges:
1. **Unstructured & Degraded Formats**: Papers, mobile photos (often blurry or tilted), and flattened PDF scans lack selectable text layers and cannot be indexed by standard storage drives.
2. **Costly Lapsed Deadlines**: Lapsed vehicle insurance, forgotten warranty cutoffs, or expired health policies trigger direct financial penalties and legal exposure.
3. **Privacy Risks with Public AI**: Uploading unredacted government IDs, medical summaries, and financial records to public commercial AI models risks data leakage, model training on customer data, and cross-tenant pollution.

### The DocVault Solution
DocVault combines **local image conditioning**, **hybrid optical character recognition (OCR)**, **Groq-accelerated multimodal extraction**, and an **air-tight conversational RAG pipeline** inside an enterprise-grade modular monolith:
- 🚀 **Zero-Hallucination Bounded RAG**: AI queries strictly draw answers from the user's uploaded vault documents.
- 🔍 **Hybrid Multi-Format Ingestion**: Ingests native PDFs, scanned flattened PDFs, and mobile images (JPG, PNG, WEBP).
- 🗓️ **Automatic Expiry Extraction & Calendar Sync**: Identifies expiration dates, schedules deadline reminders, and exports RFC-5545 `.ics` feeds directly into Google Calendar, Apple Calendar, and Outlook.
- 🔐 **Dual-Tier Authentication**: User credential verification followed by a dedicated hardware-keypad or touch-supported 4-to-6 digit Vault PIN.

---

## 🏗️ System Architecture

### High-Level Topology & Data Flow

```mermaid
graph TD
    UserClient["Web / Mobile Client<br/>React 19 + Vite (Port 5173)"] -->|HTTPS / REST API| ExpressGateway["Express.js Production Gateway<br/>(Port 5001)"]
    
    subgraph "Authentication & Security Perimeter"
        ExpressGateway -->|Verify Credentials| UserAuth["JWT + Bcrypt<br/>Tier 1: Password | Tier 2: Vault PIN"]
        UserAuth -->|Enforce Tenant Scope| TenantIsolation["Strict Multi-Tenant Guard<br/>userId Filter on Every Query"]
    end

    subgraph "Ingestion & Hybrid OCR Pipeline"
        TenantIsolation --> UploadHandler["Multer Memory Buffer<br/>(25 MB Limit)"]
        UploadHandler --> DocTypeCheck{"File Format?"}
        
        DocTypeCheck -->|Native PDF| NativePDF["pdf-parse (Fast Text Layer Extraction)"]
        DocTypeCheck -->|Scanned PDF| PDFImg["pdf-img-convert (Page 1 Rasterization)"]
        DocTypeCheck -->|Direct Image| ImgBranch["JPG / PNG / WEBP Buffer"]
        
        PDFImg --> SharpFilter["Sharp Image Conditioning<br/>Grayscale + Normalize + Sharpen"]
        ImgBranch --> SharpFilter
        
        SharpFilter --> TessEngine["Tesseract.js Local OCR Engine"]
        
        TessEngine --> OCRCheck{"Text Length &ge; 20 Chars?"}
        OCRCheck -->|Yes| TextStream["Extracted Text Buffer"]
        OCRCheck -->|No / Low Quality| GroqVision["Groq Multimodal Vision Engine<br/>qwen/qwen3.8-27b"]
    end

    subgraph "AI Extraction & Semantic Processing"
        TextStream --> GroqLPU["Groq Cloud LPU Acceleration<br/>(qwen/qwen3.8-27b)"]
        GroqVision --> StructuredJSON["Normalized Entity JSON<br/>(Title, Summary, Expiry, KeyDetails)"]
        GroqLPU --> StructuredJSON
        
        StructuredJSON --> HFEmbed["Hugging Face Inference API<br/>(BAAI/bge-small-en-v1.5 384-d Embeddings)"]
    end

    subgraph "Persistent Storage Tier"
        StructuredJSON --> MongoVault[("MongoDB Atlas Database<br/>Users, Documents, Assets, Deadlines, AuditLogs")]
        HFEmbed --> MongoVault
    end

    subgraph "Downstream Capabilities"
        MongoVault --> RAGCopilot["Bounded RAG Copilot<br/>(react-markdown + remark-gfm)"]
        MongoVault --> CalSync["RFC-5545 iCalendar Engine<br/>(GET /api/deadlines/calendar.ics)"]
        MongoVault --> ExportEngine["Portable Vault JSON Backup & Audit Trail"]
    end
```

---

## 📂 Modular Directory Structure

The repository follows a **Feature-Based Modular Architecture** for React on the frontend and a **Layered Modular Architecture** for Express on the backend:

```text
DocVault-New/
├── backend/                             # Primary Express Gateway & REST API
│   ├── src/
│   │   ├── config/                      # Centralized environment configuration
│   │   │   └── index.js
│   │   ├── middleware/                  # Request guards & stream handlers
│   │   │   ├── auth.middleware.js       # JWT & query parameter verification
│   │   │   └── upload.middleware.js     # Multer 25MB memory buffer configuration
│   │   ├── modules/                     # Domain-driven feature modules
│   │   │   ├── auth/                    # Registration, login & Vault PIN verification
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.model.js
│   │   │   │   ├── auth.routes.js
│   │   │   │   └── auth.service.js
│   │   │   ├── documents/               # Ingestion, OCR parsing & metadata management
│   │   │   │   ├── document.model.js
│   │   │   │   └── document.routes.js
│   │   │   ├── assets/                  # Household & vehicle asset registry
│   │   │   │   ├── asset.model.js
│   │   │   │   └── asset.routes.js
│   │   │   ├── deadlines/               # Renewal tracking & iCalendar export
│   │   │   │   ├── deadline.model.js
│   │   │   │   └── deadline.routes.js
│   │   │   ├── ai/                      # Vector-assisted bounded Q&A
│   │   │   │   └── ai.routes.js
│   │   │   └── vault/                   # Tamper-evident audit trail & JSON backup
│   │   │       ├── auditLog.model.js
│   │   │       └── vault.routes.js
│   │   ├── services/                    # Shared infrastructure adapters
│   │   │   ├── ai/
│   │   │   │   ├── groqService.js       # Groq SDK client (Qwen 3.8 27B Vision / Text)
│   │   │   │   └── huggingFaceService.js# BAAI/bge-small-en-v1.5 embedding vectors
│   │   │   ├── ocr/
│   │   │   │   └── ocrService.js        # Sharp image preprocessing & Tesseract.js
│   │   │   └── storage/
│   │   │       ├── cloudflareR2Service.js # S3-compatible Cloudflare R2 client
│   │   │       └── firebaseService.js   # Google Cloud / Firebase storage client
│   │   ├── utils/
│   │   │   └── sanitize.js              # MongoDB Map key normalization
│   │   ├── app.js                       # Express app configuration & middleware mounts
│   │   └── server.js                    # DNS fallback, database connection & server entry
│   ├── .env.example                     # Environment template for backend
│   └── package.json
│
├── frontend/                            # React 19 Client SPA
│   ├── public/
│   │   └── manifest.json
│   ├── src/
│   │   ├── app/                         # Application bootstrap
│   │   │   ├── App.jsx                  # Root container component
│   │   │   ├── providers.jsx            # Context providers wrapper
│   │   │   └── routes.jsx               # Protected client route definitions
│   │   ├── assets/                      # Static branding assets
│   │   │   ├── fonts/
│   │   │   ├── icons/
│   │   │   ├── illustrations/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── common/                  # Reusable UI widgets
│   │   │   └── layout/                  # Shell components (AppLayout, BottomNav)
│   │   ├── features/                    # Feature-based pages & business logic
│   │   │   ├── auth/                    # Login, Register, EnterPin & AuthContext
│   │   │   ├── dashboard/               # HomePage overview & MorePage settings
│   │   │   ├── documents/               # Document listings, filters & detail view
│   │   │   ├── upload/                  # File dropzone & live OCR analysis
│   │   │   ├── assets/                  # Asset management & document linkage
│   │   │   ├── deadlines/               # Expiration timeline & .ICS export
│   │   │   └── ai-assistant/            # Markdown-rendered conversational RAG
│   │   ├── services/
│   │   │   └── api/                     # Centralized API client (apiClient.js)
│   │   ├── styles/                      # Global design system & index.css
│   │   ├── utils/                       # Formatters & helper utilities
│   │   ├── config.js                    # API endpoint configuration
│   │   └── main.jsx                     # Vite entry point
│   ├── .env.example                     # Environment template for frontend
│   ├── vite.config.js
│   └── package.json
│
└── python-service/                      # Decoupled Standalone Python Microservice
    ├── app/
    │   ├── core/                        # Configuration & PyMongo database adapter
    │   ├── services/                    # Groq, HuggingFace & Firebase clients
    │   └── main.py                      # FastAPI application router & health check
    └── requirements.txt
```

---

## ⚡ Technology Stack

| Layer | Component | Version | Purpose & Architectural Justification |
|:---|:---|:---|:---|
| **Frontend Framework** | React | `^19.3.1` | Modern component architecture, state hooks, and fast virtual DOM diffing |
| **Tooling & Bundler** | Vite | `^8.3.5` | Instant HMR development server and optimized Rollup production bundling |
| **Routing** | React Router DOM | `^7.18.4` | Declarative routing with nested layouts and route guards |
| **Icons & UI Kit** | Lucide React | `^1.62.0` | Accessible, consistent SVG iconography |
| **Markdown Parser** | `react-markdown` + `remark-gfm` | `^10.1.0` / `^4.0.1` | GitHub Flavored Markdown rendering with tables, headings, and code blocks |
| **Backend Runtime** | Node.js (ES Modules) | `>=20.0` | High-throughput asynchronous event-loop runtime |
| **HTTP Framework** | Express.js | `^5.3.0` | Lightweight REST API routing with middleware chaining |
| **Database & ODM** | MongoDB Atlas + Mongoose | `^9.11.4` | Flexible schema modeling dynamic metadata, embedded files, and audit logs |
| **Image Preprocessing** | Sharp | `^0.35.5` | High-performance C-libvips processing (greyscale, normalization, sharpening) |
| **PDF Extraction** | `pdf-parse` | `^2.4.5` | Direct text layer extraction for digital PDFs |
| **PDF Rasterization** | `pdf-img-convert` | `^2.0.0` | Converts scanned multi-page PDFs to PNG buffers for visual OCR |
| **Optical Character Recognition** | `tesseract.js` | `^7.0.0` | Pure JavaScript / WebAssembly client for local on-premise text extraction |
| **Multimodal Vision & LLM** | Groq SDK (`qwen/qwen3.8-27b`) | `^1.6.0` | Ultra-fast LPU inference for document entity extraction and conversational RAG |
| **Embeddings** | Hugging Face API (`BAAI/bge-small-en-v1.5`) | `REST` | 384-dimensional vector embeddings for semantic document ranking |
| **Security & Auth** | `bcryptjs` + `jsonwebtoken` | `^3.0.3` / `^9.0.3` | Multi-round salted hashing and secure token-based authorization |

---

## 🚀 Key Features & Workflows

### 1. Dual-Tier Authentication & Physical Keypad Support
- **Tier 1 (Password Barrier)**: Authenticates credentials against Bcrypt hashes; returns a temporary session indicating PIN unlock is required.
- **Tier 2 (Vault PIN Barrier)**: A 4-to-6 digit security PIN unlocks full vault access (`7d` JWT).
- **Physical Keypad & Numpad Ergonomics**: Dedicated on-screen keypad plus global listeners for standard keyboard and PC Numpad keys (`Numpad0`–`Numpad9`, `Backspace`, `Enter`, `Escape`).

### 2. Multi-Tier Hybrid OCR Pipeline
Uploaded documents pass through a resilient fallback cascade:
```text
File Upload ──► Native PDF? ──[Yes]──► pdf-parse text extraction
                     │
                    [No / Scanned PDF / Image]
                     ▼
          Sharp Image Conditioning (Grayscale + Normalize + Sharpen)
                     │
                     ▼
             Tesseract.js Local OCR
                     │
        Extracted Characters >= 20?
          ├── [Yes] ──► Groq Text Entity Extraction
          └── [No]  ──► Groq Vision VLM (Qwen 3.8 27B Multimodal Analysis)
```

### 3. Automatic Entity & Renewal Date Scheduling
- Documents are categorized automatically (`Insurance`, `Identity`, `Appliances`, `Property`, `Medical`, `Other`).
- Dynamic key-value pairs (e.g., `Policy Number`, `Vehicle Number`, `Coverage Limit`, `Serial Number`) are extracted and stored with sanitization against MongoDB key conflicts.
- Detected expiration dates automatically generate reminders in the `deadlines` schedule.

### 4. Bounded Context Conversational RAG Copilot
- Accessible via the **Ask AI** tab (`/ask-ai`).
- Uses strict prompt bounding to limit answers exclusively to the user's stored vault documents.
- Renders Markdown responses with tables, bullet lists, and policy references via `react-markdown` and `remark-gfm`.

### 5. RFC-5545 iCalendar (.ICS) Export
- Endpoint: `GET /api/deadlines/calendar.ics`
- Dynamically compiles upcoming renewal dates into standard iCalendar events.
- Compatible with **Google Calendar**, **Apple Calendar**, and **Microsoft Outlook**.

### 6. Portable Vault Export & Audit Trail
- **Vault Export (`GET /api/vault/export`)**: Exports complete document records, asset inventory, and schedules as an offline-readable, portable JSON backup.
- **Audit Logging (`GET /api/vault/audit-trail`)**: Maintains an append-only log of security and document access events (`VIEW`, `DOWNLOAD`, `UPLOAD`, `DELETE`).

---

## 🔒 Security & Isolation Architecture

1. **Strict Multi-Tenant Isolation**: Every database operation is bound to `req.user.userId`. Cross-tenant lookups and data contamination are strictly prevented.
2. **Context Window Boundary**: The AI assistant only receives context retrieved for the authenticated user, preventing cross-tenant leakage.
3. **NoSQL Injection Guard**: User metadata keys are sanitized using character replacement (`.` and `$` replaced with `_`) before MongoDB persistence.
4. **CORS Whitelist**: Cross-Origin Resource Sharing is locked down to authorized production origins and local development ports.
5. **Private Storage**: Document files remain in internal database storage or pre-signed external cloud buckets, never exposed via open public directories.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/auth/register` | Register new user with password and 4-6 digit Vault PIN | No |
| `POST` | `/api/auth/login` | Authenticate email and password; prompts for PIN | No |
| `POST` | `/api/auth/verify-pin` | Verify Vault PIN and receive full session JWT | No |

### Documents (`/api/documents`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/documents` | List user documents (supports `?category=` and `?q=`) | **Yes** |
| `GET` | `/api/documents/:id` | Retrieve metadata and log a `VIEW` audit event | **Yes** |
| `POST` | `/api/documents/upload` | Multipart file upload with automated OCR and Groq extraction | **Yes** |
| `GET` | `/api/documents/:id/download` | Stream binary document file inline | Optional (Token query param) |
| `PATCH` | `/api/documents/:id` | Update metadata or link document to an asset | **Yes** |
| `DELETE` | `/api/documents/:id` | Remove document and clean up associated deadlines | **Yes** |

### Assets & Inventory (`/api/assets`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/assets` | Retrieve user assets with populated document relations | **Yes** |
| `POST` | `/api/assets` | Create asset and link related documents | **Yes** |
| `DELETE` | `/api/assets/:id` | Delete asset record | **Yes** |

### Deadlines & Calendar (`/api/deadlines`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/api/deadlines` | Fetch chronological deadline schedule | **Yes** |
| `GET` | `/api/deadlines/calendar.ics` | Download standard RFC-5545 iCalendar schedule | No (Filterable by Token) |

### AI Copilot & Vault Operations (`/api/ai`, `/api/vault`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/ai/query` | Ask questions over user vault documents | **Yes** |
| `GET` | `/api/vault/export` | Export full vault metadata and document inventory as JSON | **Yes** |
| `GET` | `/api/vault/audit-trail` | Fetch recent security audit records | **Yes** |
| `GET` | `/api/health` | Service health status (MongoDB, Groq, HuggingFace) | No |

---

## 💻 Local Setup & Quickstart

### Prerequisites
- **Node.js** `>= 20.0.0`
- **npm** `>= 10.0.0`
- **MongoDB** (Atlas cluster connection string or local MongoDB instance)
- **Groq Cloud API Key** ([console.groq.com](https://console.groq.com/))
- **Hugging Face Token** ([huggingface.co/settings/tokens](https://huggingface.co/settings/tokens))

### 1. Backend Configuration & Startup

```bash
# Navigate to the backend directory
cd backend

# Copy environment template
cp .env.example .env

# Install backend dependencies
npm install --ignore-scripts

# Start development server
npm run dev
```
> The backend server initializes on `http://localhost:5001`.

### 2. Frontend Configuration & Startup

```bash
# In a new terminal, navigate to the frontend directory
cd frontend

# Copy environment template
cp .env.example .env

# Install frontend dependencies
npm install

# Start Vite development server
npm run dev
```
> The frontend application launches on `http://localhost:5173`.

### 3. Production Build Verification

```bash
# Verify frontend production bundle
cd frontend
npm run build
```

---

## 📋 Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example / Default |
|:---|:---|:---|
| `PORT` | Node HTTP listening port | `5001` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb+srv://user:pass@cluster.mongodb.net/docvault` |
| `GROQ_API_KEY` | Groq Cloud API authentication key | `gsk_...` |
| `GROQ_MODEL` | Vision / LLM model name | `qwen/qwen3.8-27b` |
| `HUGGINGFACE_API_KEY` | Hugging Face Inference access token | `hf_...` |
| `HF_EMBEDDING_MODEL` | Vector embedding model | `BAAI/bge-small-en-v1.5` |
| `JWT_SECRET` | Cryptographic secret for signing JWTs | `your_secure_secret_key` |
| `CLOUDFLARE_R2_*` | Optional S3-compatible cloud storage | Account ID, Access Keys, Bucket Name |

### Frontend (`frontend/.env`)
| Variable | Description | Example / Default |
|:---|:---|:---|
| `VITE_API_BASE_URL` | Base URL of the backend API gateway | `http://localhost:5001` |

---

## 📄 License
This project is licensed under the MIT License.
