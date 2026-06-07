import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

# Setup Logging
logger = logging.getLogger("resume_analyzer.database")
logging.basicConfig(level=logging.INFO)

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:1234@localhost/resume_analyzer")

# Pre-create the database if it doesn't exist (MySQL specific self-healing setup)
def create_database_if_not_exists():
    try:
        # Parse connection details
        # For mysql+pymysql://root:1234@localhost/resume_analyzer
        parsed = urlparse(DATABASE_URL)
        db_name = parsed.path.lstrip('/')
        
        # Build connection URL to the server without specific DB
        server_url = f"{parsed.scheme}://{parsed.netloc}/"
        
        logger.info(f"Connecting to MySQL server to verify database existence: {parsed.netloc}")
        temp_engine = create_engine(server_url, connect_args={"connect_timeout": 5})
        
        with temp_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            conn.commit()
            
        logger.info(f"Database validation complete. Database '{db_name}' is verified/created.")
        temp_engine.dispose()
    except Exception as e:
        logger.error(f"Failed to auto-create database: {str(e)}. Proceeding assuming it exists.")

# Execute DB auto-creation checks
create_database_if_not_exists()

# Create SQLAlchemy engine and session
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# DB dependency for routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables based on declarative base models."""
    try:
        # Import models here to ensure they register on Base metadata before create_all
        from models.analysis_model import User, Analysis
        Base.metadata.create_all(bind=engine)
        logger.info("Database schemas/tables initialized successfully in MySQL.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {str(e)}")
        raise e
