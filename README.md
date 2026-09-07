# 🌍 ROAMEO - Smart Local Discovery & Exploration Platform

ROAMEO is a modern fullstack web platform designed for seamless local exploration, smart recommendations, authentic shopping discoveries, and community engagement.

---

## 🏗️ Architecture Overview

The repository is organized as a unified fullstack monorepo:

```
ROAMEO/
├── backend/                  # Python FastAPI REST API
│   ├── app/
│   │   ├── main.py           # FastAPI application entrypoint
│   │   ├── routes/           # API Endpoints (auth, shops, recommendations, notifications, etc.)
│   │   ├── services/         # Business logic & recommendation engines
│   │   └── models/           # Data schemas & Supabase interactions
│   ├── seed/                 # Database schema and seed scripts
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Backend environment variables template
│
├── frontend/                 # Next.js 14 Web Application
│   ├── app/                  # Next.js App Router (pages & layouts)
│   ├── components/           # Reusable UI components & Auth providers
│   ├── lib/                  # Client utilities & Supabase client
│   ├── package.json          # Node dependencies & scripts
│   └── .env.example          # Frontend environment variables template
│
├── .gitignore                # Root ignore file preventing secrets & build files from commit
└── README.md                 # Project documentation
```

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, HTTPX
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Supabase Auth)

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **Python**: v3.10+
- **Supabase Account**: A Supabase project with database configured (see `backend/seed/schema.sql`)

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Supabase project credentials:
     ```env
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
     SUPABASE_JWT_SECRET=your-supabase-jwt-secret
     FRONTEND_URL=http://localhost:3000
     ```

5. Start the backend API server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API Docs will be available at: `http://localhost:8000/docs`

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Fill in your frontend environment variables:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
     NEXT_PUBLIC_API_URL=http://localhost:8000
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at: `http://localhost:3000`

---

## 🔒 Security Best Practices

- **Never commit `.env` or `.env.local` files**: Both `frontend` and `backend` environment files are protected by `.gitignore`.
- Always distribute `.env.example` templates with empty placeholders for team members and CI/CD pipelines.

---

## 👤 Author
- **GitHub**: [@suriya-s311](https://github.com/suriya-s311)
