import os
import uvicorn
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Import routing modules and database utilities
from database import init_db
from routes import auth, analyze, history

load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("resume_analyzer.main")

# Initialize FastAPI App
app = FastAPI(
    title="AI Resume Analyzer API",
    description="Production-Ready Resume ATS evaluation API powered by Anthropic Claude.",
    version="1.0.0"
)

# CORS Middleware Configurations
# Allows local Vite development server and production client hosting domains
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resume-analyzer-frontend.vercel.app",  # Example placeholder for Vercel deployment
    "*"  # Fallback wildcard for local dev flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup DB Event
@app.on_event("startup")
def on_startup():
    logger.info("Starting up API application...")
    try:
        init_db()
    except Exception as e:
        logger.critical(f"Startup database initialization failed: {str(e)}")
        # In production, we might want to shut down or raise. We allow startup to see errors in logs.

# Global Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global unhandled error for {request.method} {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Please contact the system administrator or check logs."}
    )

# Register Sub-Routers
app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(history.router)

# Health check endpoint
@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyzer API",
        "database": "MySQL (SQLAlchemy)",
        "model_configured": os.getenv("CLAUDE_MODEL_STRING", "claude-sonnet-4-20250514")
    }

if __name__ == "__main__":
    # Fetch port configuration or default to 8000
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    
    logger.info(f"Launching FastAPI Server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
