# NiryanaAI — AI-Powered BIS Compliance Screening Engine
### Smart India Hackathon Prototype | Problem Statement #108 (GeM Procurement)

[![Tests](https://img.shields.io/badge/tests-34%2F34%20passing-brightgreen)](#automated-test-suite)
[![Architecture](https://img.shields.io/badge/engine-Hybrid%20RAG%20%2B%20Deterministic-blue)](#architecture--pipeline)
[![Embeddings](https://img.shields.io/badge/embeddings-Local%20Multilingual%20Transformers-orange)](#tech-stack)
[![Security](https://img.shields.io/badge/auth-JWT%20%2B%20RBAC-purple)](#security--governance)

**NiryanaAI** is an intelligent procurement compliance and standards recommendation platform designed for the **Government e-Marketplace (GeM)**. It automates the extraction of procurement requirements from raw tender documents, maps mandatory **Bureau of Indian Standards (BIS)** specifications, and deterministically evaluates contractor lab test reports against official BIS parameter thresholds to prevent vendor fraud.

---

## 📌 Problem & Solution Overview

| The Challenge in GeM Procurement | How NiryanaAI Solves It |
|---|---|
| **Manual Rulebook Cross-Referencing**: Officers take days reading hundreds of pages of tender technical specifications. | **AI Clause Extraction**: Parses PDF/TXT tenders, extracts engineering requirements, and maps matching BIS standards in seconds. |
| **Language Barriers**: Local contractors and municipal officers search in Indic languages or colloquial terms. | **Bilingual Semantic Search**: Uses multilingual sentence embeddings supporting English and Hindi (`छत के पंखे`, `सीमेंट`, `सरिया`). |
| **Vendor Fraud & Defective Materials**: Substandard or uncertified products slip through manual review without lab validation. | **Deterministic Compliance Screening**: Evaluates NABL lab parameters against BIS tolerances (`>=`, `<=`, `includes`) with color-coded verdicts (🟢 Pass, 🟡 Verify, 🔴 Fail). |
| **AI Hallucinations in Governance**: Generative AI models often fabricate standard numbers or clause rules. | **Zero-Hallucination RAG**: Grounded citations referencing exact BIS clause numbers with direct backlinks to the official BIS Gazette. |
| **Lack of Accountability**: Unclear decision audit trails for vigilance audits. | **Qualified Engineer Sign-Off**: Role-based digital sign-off and tamper-evident downloadable Audit JSON export. |

---

## 🏗️ Architecture & Pipeline

```
[ Tender Document (PDF/TXT) or Plain Query ]
                     │
                     ▼
       ┌───────────────────────────────┐
       │   Intelligent Pre-Processor   │  ◄── Hindi Translation & Normalization
       └──────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ Exact IS Regex Matcher ]   [ Local Multilingual Transformer ]
  (e.g., IS 269:2015,         (Xenova/paraphrase-multilingual-
   resolves to active year)    MiniLM-L12-v2 — 0 API Cost)
        │                           │
        └─────────────┬─────────────┘
                      ▼
       ┌───────────────────────────────┐
       │     MongoDB Vector Store      │  ◄── Strict 0.40 Confidence Cutoff
       └──────────────┬────────────────┘      (Rejects False Positives)
                      │
                      ▼
       ┌───────────────────────────────┐
       │   AI Explainability Engine    │  ◄── Grounded Clause Citations &
       │       (Google Gemini)         │      Official BIS Gazette Backlinks
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │ Deterministic Screening Engine│  ◄── Evaluates NABL Lab Report Values
       │   (Math Operators >=, <=, ==) │      (5% Borderline Tolerance Guard)
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │ Qualified Engineer Review &   │  ◄── Digital Sign-off, JSON Export,
       │ Vigilance Audit JSON Trail    │      & Real-time Custom Bid Re-test
       └───────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Key Capabilities |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | Responsive procurement portal, custom bid drawer, animated skeleton loading, 404 handler |
| **API Client** | Axios (Centralized Instance) | Environment-configurable base URL, automatic JWT Bearer token request interceptor |
| **Backend** | Node.js, Express 5 | REST API, Multer upload parser, cold-start guard, rate & ReDoS protection |
| **Database** | MongoDB 6+ (Mongoose 9) | Normalized IS schema (`normalizedIsNumber`, `baseIsNumber`), unique index collision guards |
| **Semantic AI** | `@xenova/transformers` | Local inference (`Xenova/paraphrase-multilingual-MiniLM-L12-v2`), 0 latency / 0 API cost |
| **Explainability** | Google Gemini API (`gemini-3.5-flash`) | Contextual procurement rationale, clause citation extraction, rule-based fallback |
| **Security** | JWT, bcryptjs | Role-Based Access Control (`user` vs `admin`), search history data isolation |
| **Testing** | Node Native Test Runner (`node:test`) | 34 automated unit, integration, and security tests |

---

## ⚡ Quick Start & Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **MongoDB**: Running locally on port `27017`
* **Git**

---

### Step 1 — Clone and Switch to Working Branch

```bash
git clone https://github.com/oggy111005/NiryanaAI.git
cd NiryanaAI
git checkout changes
```

---

### Step 2 — Backend Configuration (Terminal 1)

```bash
cd server
npm ci
```

**Set up environment variables:**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Ensure your `server/.env` file contains:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/is-recommend-changes
JWT_SECRET=sih2026_local_dev_secret_key_982347102938471092
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-3.5-flash
RECOMMENDATION_CONFIDENCE_THRESHOLD=0.40
```

**Bootstrap First Admin (One-time only):**
```bash
# Windows PowerShell
$env:BOOTSTRAP_ADMIN_USERNAME="admin"
$env:BOOTSTRAP_ADMIN_PASSWORD="sih@2026"
node bootstrap-admin.js

# Linux / macOS
BOOTSTRAP_ADMIN_USERNAME="admin" BOOTSTRAP_ADMIN_PASSWORD="sih@2026" node bootstrap-admin.js
```
*(Refuses duplicates safely if an admin already exists).*

**Seed Authentic BIS Standards:**
```bash
node seed.js
```
*(Embeds official standards into MongoDB with local embeddings. Safe to re-run; uses `$setOnInsert`).*

**Start Backend Server:**
```bash
node server.js
```
Wait for confirmation:
```
AI Model loaded for inference.
Connected to MongoDB database: 'is-recommend-changes' on host: '127.0.0.1:27017'
Server running on port 5000
```

---

### Step 3 — Frontend Configuration (Terminal 2)

```bash
cd client
npm install
```

**Set up environment variables:**
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```
*(Default `VITE_API_BASE_URL=http://localhost:5000` is pre-configured).*

**Start Vite Dev Server:**
```bash
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

### Step 4 — Default Login Credentials

| Portal | URL | Username | Password | Role |
|---|---|---|---|---|
| **Procurement User** | `http://localhost:5173/user-login` | *(Register via Admin)* | *(Assigned password)* | `user` |
| **Admin Portal** | `http://localhost:5173/admin-login` | `admin` | `sih@2026` | `admin` |

---

## 🎯 Key Application Workflows

### 1. Bilingual Search & Query Disambiguation (`/`)
* **Exact Matching**: Queries like `IS 269` or `IS 269:2015` bypass AI inference and resolve directly to the highest active publication year.
* **Indic / Hindi Queries**: Searches like `"छत के पंखे के लिए सुरक्षा मानक"` automatically translate and match `IS 374:2019`.
* **Hallucination Shield**: Queries below confidence `0.40` return a helpful *"Search Refinement Needed"* notice rather than misleading matches.

### 2. Explainability & Clause Citations (`/results`)
* Click **"Why was this standard recommended?"** to view grounded citations with clause numbers (e.g. Clause 4.1, Clause 4.2), text extracts, and direct BIS portal URLs.
* Click **"Save" (Bookmark)** to persist standards to local audit storage with visual confirmation.

### 3. GeM Tender Simulator (`/tender`)
* **Clause Extraction**: Upload or paste tender requirements (e.g. Bridge construction specifications).
* **BIS Checklist**: AI segments clauses and maps required standards (`IS 269:2015`, `IS 1786:2008`).
* **Deterministic Lab Screening**:
  * **🟢 Compliant Preset**: Verifies passing compressive strength and sulfur limits.
  * **🟡 Verify Preset**: Flags borderline parameters within 5% tolerance for Qualified Engineer review.
  * **🔴 Non-Compliant Preset**: Catches substandard strength or revoked certifications.
* **Custom Bid Entry Form**: Slide-out drawer allows live editing of contractor names, NABL lab report IDs, and numeric parameters for instant re-screening.
* **Digital Audit Trail**: Qualified Engineer signs off with remarks, exporting a complete **Audit JSON Report**.

### 4. Admin Management (`/admin`)
* Upload PDF/TXT specification documents to auto-extract and vectorize new standards.
* Add, edit, or remove procurement officers with role-based access.

---

## 🧪 Automated Test Suite

The project includes **34 automated tests** with 100% pass rate using the native Node.js test runner:

```bash
cd server
npm test
```

### Test Coverage Breakdown:
* **Phase 1: Security & RBAC (13 tests)**
  * Health check data protection, unauthenticated route rejection (401), role enforcement (403), bcrypt password hashing, malicious MIME/signature upload rejection, cold-start 503 guard, user search-history privacy, idempotent admin bootstrap.
* **Phase 2: Data Safety & Schema Normalization (5 tests)**
  * Safety check on test database name, normalized and base IS computation (`is269:2015`), idempotent seeding ($setOnInsert), non-destructive duplicate collision detection, clean index migration.
* **Phase 3: Retrieval Quality & Hallucination Guard (6 tests)**
  * Exact versioned lookup, base-number highest-year resolution, obsolete edition suppression, confidence threshold rejection (<0.40), ReDoS / regex injection sanitization.
* **Phase 4: Explainability & Citations (4 tests)**
  * Grounded explanation verification, input validation, 400/404 handling, citation formatting.
* **Phase 5: GeM Compliance Screening Engine (6 tests)**
  * Unauthenticated rejection, parameter evaluation, mathematical operator verification (`>=`, `<=`, `includes`), borderline 5% tolerance detection.

---

## 📁 Project Structure

```
NiryanaAI/
├── client/                              # Frontend React application (Vite)
│   ├── .env.example                     # Environment template (VITE_API_BASE_URL)
│   ├── src/
│   │   ├── api.js                       # Centralized Axios instance with JWT interceptor
│   │   ├── App.jsx                      # App router, ProtectedRoute, & navigation
│   │   ├── AuthContext.jsx              # Lazy session initializer & token management
│   │   ├── components/
│   │   │   └── Chatbot.jsx              # Floating AI procurement chatbot
│   │   └── pages/
│   │       ├── Home.jsx                 # Bilingual search interface
│   │       ├── Results.jsx              # Search cards & explainability citation drawer
│   │       ├── Detail.jsx               # Standard metadata, clauses, bookmark & skeleton loader
│   │       ├── TenderSimulator.jsx      # GeM tender pipeline, screening engine & custom bid drawer
│   │       ├── History.jsx              # User search audit history
│   │       ├── Admin.jsx                # Standards upload & user administration
│   │       ├── DatabaseView.jsx         # Catalog viewer
│   │       ├── Login.jsx                # Role-based authentication
│   │       └── NotFound.jsx             # 404 catch-all page
│   └── package.json
├── server/                              # Backend Express application
│   ├── models/
│   │   ├── Standard.js                  # BIS schema with normalization pre-validate hooks
│   │   ├── User.js                      # User schema with bcrypt pre-save hook
│   │   └── History.js                   # Isolated query audit schema
│   ├── test/                            # Formal 34-test automated suite
│   │   ├── phase1_security.test.js      # Security & RBAC tests
│   │   ├── phase2_seed_safety.test.js   # Normalization & migration tests
│   │   ├── phase3_retrieval.test.js     # Exact match & threshold rejection tests
│   │   ├── phase4_explainability.test.js# Citation & explanation tests
│   │   └── phase5_compliance.test.js    # Deterministic screening tests
│   ├── bootstrap-admin.js               # CLI first-admin bootstrap utility
│   ├── clean-demo-standards.js          # MongoDB cleanup utility
│   ├── seed.js                          # Vector embedding seeder for BIS catalog
│   ├── server.js                        # Core Express API routes & middleware
│   └── package.json
└── README.md
```

---

## 🛡️ Security & Governance Highlights

* **No Hardcoded Secrets**: All sensitive parameters (JWT secrets, Mongo URIs, API keys) are strictly managed via `.env` files.
* **ReDoS & Injection Immunity**: Regex patterns in search routes use strict character escaping.
* **Malicious File Upload Guard**: PDF uploads inspect binary `%PDF-` file signatures, rejecting renamed executable binaries.
* **Deterministic Rule Engine**: AI does not guess compliance numbers. A mathematical evaluator checks exact numerical lab values against BIS tolerance ranges to ensure legal certainty.

---

## 👥 Contributors — Team NiryanaAI
Developed for the **Smart India Hackathon (SIH)** — Problem Statement #108.
