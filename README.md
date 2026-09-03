# NiryanaAI Prototype (Smart India Hackathon)

This is a beginner-friendly MERN stack prototype designed to help procurement officials find relevant Indian Standards (IS) based on free-text product descriptions, using local AI semantic search.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **AI/Semantic Search**: `@xenova/transformers` (`Xenova/all-MiniLM-L6-v2`) running locally in Node.

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally (default: `mongodb://127.0.0.1:27017/is-recommend`) or a MongoDB Atlas URI.

### 1. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment (`.env`):
   Copy `.env.example` to `.env` in the `server` directory and set your `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```
   Required variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/is-recommend-changes
   JWT_SECRET=your_secure_jwt_secret
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Initial Admin Bootstrapping (One-Time Setup)**:
   To create the first administrator account safely without hardcoded credentials:
   ```bash
   # In Windows PowerShell:
   $env:BOOTSTRAP_ADMIN_USERNAME="admin"
   $env:BOOTSTRAP_ADMIN_PASSWORD="your_secure_password"
   node bootstrap-admin.js
   ```
   *Note: The bootstrap script only creates an admin if no admin account currently exists. It will safely refuse execution if an admin is already present.*

5. Start the backend server:
   ```bash
   npm run dev
   # or
   node server.js
   ```
   The backend should now be running on `http://localhost:5000`.


### 2. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and go to `http://localhost:5173`.

## Features
- **Semantic Search**: Uses local embeddings to understand intent beyond keyword matching.
- **Recommendations**: Displays primary and allied/related standards with a similarity score.
- **History Tracking**: Saves recent queries.
- **Admin Panel**: Allows adding new standards dynamically (automatically generates new embeddings).

*Note: The frontend can also be built and synced with Stitch UI generation as requested.*

