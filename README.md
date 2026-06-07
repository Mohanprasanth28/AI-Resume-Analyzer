# Full-Stack AI Resume Analyzer (Production Ready)

A production-grade web application to evaluate, grade, and optimize candidate resumes against target job descriptions using advanced AI matching models. 

Built using a React (Vite) frontend with Tailwind CSS, and a FastAPI backend powered by SQLAlchemy and Anthropic Claude (`claude-sonnet-4-20250514`).

---

## Technical Stack & Architecture

### Backend (`backend/`)
- **FastAPI**: Asynchronous high-performance web routing framework.
- **SQLAlchemy (with PyMySQL)**: MySQL database integration and mapping.
- **Anthropic Python SDK**: Integrates Claude Sonnet for resume evaluations.
- **PyMuPDF (fitz)**: Lightweight high-fidelity parser to extract text from PDF files.
- **ReportLab**: PDF generator to build downloadable custom report documents.
- **Passlib & Python-Jose**: Secure password hashing (`bcrypt`) and JWT session authentication.

### Frontend (`frontend/`)
- **React (Vite)**: Clean state rendering and hot module reloading.
- **Tailwind CSS**: Sleek glassmorphism look, layouts, and custom theme switches.
- **Axios**: HTTP connection client with automated JWT interceptors.
- **React Router**: Client-side navigation pathways with Route Guards.
- **React Dropzone**: Interactive file drop regions with size validations.
- **React Hot Toast**: Real-time pop-up notification messages.

---

## Directory Structure

```text
AI Resume Analyzer/
│
├── backend/
│   ├── models/
│   │   └── analysis_model.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── analyze.py
│   │   └── history.py
│   ├── services/
│   │   ├── pdf_parser.py
│   │   ├── claude_service.py
│   │   └── report_generator.py
│   ├── database.py
│   ├── main.py
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── analyzeApi.js
│   │   ├── components/
│   │   │   ├── UploadBox.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   ├── KeywordTags.jsx
│   │   │   ├── SuggestionList.jsx
│   │   │   ├── SectionFeedback.jsx
│   │   │   ├── HistoryList.jsx
│   │   │   └── CompareView.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── History.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)
Create `backend/.env` containing:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=mysql+pymysql://root:1234@localhost/resume_analyzer
SECRET_KEY=your_jwt_signing_secret_key
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CLAUDE_MODEL_STRING=claude-sonnet-4-20250514
PORT=8000
HOST=0.0.0.0
```

### Frontend (`frontend/.env`)
Create `frontend/.env` containing:
```env
VITE_API_URL=http://localhost:8000
```

---

## Setup & Running Locally

### Step 1: MySQL Setup
1. Ensure your MySQL server is running (default port `3306`).
2. The backend database engine will automatically execute a `CREATE DATABASE IF NOT EXISTS resume_analyzer` on launch, saving you from creating tables manually!
3. Ensure the credentials in your `DATABASE_URL` matches your local MySQL username/password configuration.

### Step 2: Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   python main.py
   ```
   The backend will start running at `http://localhost:8000`. You can inspect the interactive Swagger API documentation at `http://localhost:8000/docs`.

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will start running at `http://localhost:5173`. Open this URL in your browser to interact with the application.

---

## Production Deployment

### Frontend Deployment (Vercel)
1. Install the Vercel CLI or connect your Github repository directly to [Vercel](https://vercel.com).
2. Set the framework preset to **Vite**.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist`.
5. Add the environment variable:
   - `VITE_API_URL`: Set this to your production backend URL (e.g. `https://your-api.onrender.com`).
6. Deploy!

### Backend Deployment (Render)
1. Sign up on [Render](https://render.com) and create a new **Web Service**.
2. Connect your repository containing the code.
3. Configure the following service settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Create a cloud database (e.g. A managed MySQL database instance from Aiven, DigitalOcean, or Render's PostgreSQL instance with updated drivers) and update your `DATABASE_URL`.
5. Add the required environment variables:
   - `ANTHROPIC_API_KEY`: Your valid production API key.
   - `DATABASE_URL`: Connection string to your production MySQL instance.
   - `SECRET_KEY`: A secure long random string.
   - `CLAUDE_MODEL_STRING`: `claude-sonnet-4-20250514` (or latest supported string).
6. Deploy!

---

## Troubleshooting & FAQ

### Q1: The PDF text extraction fails on my document.
- **Cause**: PyMuPDF (`fitz`) extracts raw Unicode characters. If your resume is a scanned image (photocopied paper converted to PDF) or an image-based layout without a text layer, no text can be extracted.
- **Solution**: Save the resume directly as a text PDF from Google Docs/MS Word, or use the **Paste Plain Text** tab on the dashboard.

### Q2: I get a MySQL connection error on startup.
- **Cause**: The database server credentials in `DATABASE_URL` are incorrect, the service is not running, or your credentials do not permit database creation.
- **Solution**: Confirm that MySQL is started on port 3306, and test connecting to it manually. Ensure `cryptography` and `pymysql` are installed.

### Q3: Claude API throws an invalid API key or model error.
- **Cause**: Anthropic Claude API model name `claude-sonnet-4-20250514` might not be publicly active in your Anthropic project yet, or your key is inactive.
- **Solution**: Open `backend/.env` and update `CLAUDE_MODEL_STRING` to `claude-3-5-sonnet-20241022` or `claude-3-5-sonnet-latest` which are widely available, and check your API key validity.

### Q4: The downloaded PDF report does not have a table boundary or text overflows.
- **Cause**: PDF compilation via ReportLab strictly calculates page heights. If you feed very long strings of keywords, they are wrapped automatically.
- **Solution**: Ensure your keyword arrays don't contain paragraph-length segments. The application automatically limits word wraps inside tables using ReportLab paragraphs.
