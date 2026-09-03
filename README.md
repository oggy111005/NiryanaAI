# NiryanaAI — IS Standards Recommendation Engine
### Smart India Hackathon Prototype

AI-powered search engine that helps procurement officials find the right Bureau of Indian Standards (BIS) documents using plain-English queries. Combines exact IS-number lookup with local vector embedding semantic search.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI / Semantic Search | `@xenova/transformers` — `Xenova/all-MiniLM-L6-v2` running locally in Node |
| Auth | JWT (RS256), bcrypt, role-based access control |

---

## Setup on a New PC

### Prerequisites
- Node.js v18 or higher
- MongoDB running locally on default port `27017`
- Git

---

### Step 1 — Clone and Switch to Working Branch

```bash
git clone https://github.com/oggy111005/NiryanaAI.git
cd NiryanaAI
git checkout changes
```

---

### Step 2 — Backend Setup (Terminal 1)

```bash
cd server
npm ci
```

**Configure environment:**

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Open `server/.env` and set the following:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/is-recommend-changes
JWT_SECRET=any-random-string-you-choose
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=PASTE_YOUR_API_KEY_HERE
RECOMMENDATION_CONFIDENCE_THRESHOLD=0.40
```

**Create the first admin account (one-time only):**

```bash
# Windows PowerShell
$env:BOOTSTRAP_ADMIN_USERNAME="divyansh"
$env:BOOTSTRAP_ADMIN_PASSWORD="sih@2026"
node bootstrap-admin.js
```

> The bootstrap script refuses to run if an admin already exists — safe to call multiple times.

**Seed the database with 107 IS standards:**

```bash
node seed.js
```

> ⚠️ This step is **required**. Without it, all searches return zero results.
> It generates vector embeddings locally — takes approximately **10 minutes** on first run.
> Safe to re-run (uses `$setOnInsert` — never overwrites existing records).

**Start the backend:**

```bash
node server.js
```

Wait for both of these messages before testing:
```
Connected to MongoDB database: 'is-recommend-changes' on host: '127.0.0.1'
AI Model loaded for inference.
```

> The AI model (~90 MB) downloads automatically on first start. Searches return a 503 error until it finishes loading.

---

### Step 3 — Frontend Setup (Terminal 2)

```bash
cd client
npm install
npm run dev
```

---

### Step 4 — Access the App

| URL | Purpose |
|---|---|
| `http://localhost:5173/user-login` | Login as a regular user |
| `http://localhost:5173/admin-login` | Login as admin |
| `http://localhost:5173` | Search (requires login) |

**Default admin credentials:**
```
Username: divyansh
Password: sih@2026
```

---

## Features

- **Exact IS-number lookup** — Queries like `IS 269` or `IS 269:2015` bypass the AI model entirely and return instantly. Base-number queries automatically resolve to the latest active edition by publication year.
- **Semantic search** — Natural language queries are embedded locally and matched against the standards catalog using cosine similarity. Queries below the confidence threshold return a clean rejection message instead of a false match.
- **Hallucination guard** — Queries with no confident match (below 0.40 threshold) return `"No confident Indian Standard match found"` instead of a random result.
- **History tracking** — Authenticated users can view their personal search history (isolated per user).
- **Admin panel** — Add new standards manually or via PDF/TXT upload. Embeddings are generated automatically on save.
- **IS Database view** — Browse all 107 seeded standards with status badges (`ACTIVE`, `DRAFT`, `SUPERSEDED`) and `DEMO` tags.
- **AI Chatbot** — Powered by Google Gemini for follow-up questions.

---

## Running Tests

```bash
cd server

# Windows PowerShell
$env:TEST_MONGODB_URI="mongodb://127.0.0.1:27017/is-recommend-changes-test"
$env:JWT_SECRET="any-test-secret"
npm test
```

Expected output: **25/25 tests pass** across Phase 1 (security), Phase 2 (data safety), and Phase 3 (retrieval quality).

> Tests always run against a `-test` suffixed database. The test suite refuses to run against any other database name.

---

## Project Structure

```
NiryanaAI/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── pages/           # Home, Results, Detail, History, Admin, DatabaseView, Login
│       └── components/      # Chatbot
├── server/                  # Express backend
│   ├── models/              # Standard.js, History.js, User.js
│   ├── test/                # phase1_security, phase2_seed_safety, phase3_retrieval
│   ├── server.js            # Main API server
│   ├── seed.js              # Database seeder (107 IS standards)
│   ├── bootstrap-admin.js   # One-time admin account creator
│   └── audit-and-migrate-standards.js  # Non-destructive data migration tool
└── README.md
```
