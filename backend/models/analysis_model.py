import datetime
import uuid
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

# ==========================================
# SQLAlchemy Database Models (MySQL)
# ==========================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    analyses = relationship("Analysis", back_populates="owner", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    resume_snippet = Column(Text, nullable=False)  # First few hundred chars for display in dashboard list
    resume_text = Column(Text(length=16777215), nullable=False)  # Supports up to 16MB text (MediumText)
    job_description = Column(Text(length=16777215), nullable=False)
    ats_score = Column(Integer, nullable=False)
    keyword_score = Column(Integer, nullable=False)
    format_score = Column(Integer, nullable=False)
    full_response = Column(JSON, nullable=False)  # Stored as JSON object in MySQL

    # Relationships
    owner = relationship("User", back_populates="analyses")


# ==========================================
# Pydantic Schemas for API Requests & Responses
# ==========================================

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None

# Weak Bullet point rewrite model
class WeakBullet(BaseModel):
    original: str
    rewritten: str

# Score Breakdown model
class ScoreBreakdown(BaseModel):
    section: str
    score: int

# Section Feedback model
class SectionFeedback(BaseModel):
    summary: str
    experience: str
    skills: str
    education: str

# Full Claude Analysis Response validation model
class ClaudeAnalysisResult(BaseModel):
    ats_score: int = Field(..., ge=0, le=100)
    keyword_score: int = Field(..., ge=0, le=100)
    format_score: int = Field(..., ge=0, le=100)
    missing_keywords: List[str]
    present_keywords: List[str]
    weak_bullets: List[WeakBullet]
    score_breakdown: List[ScoreBreakdown]
    top_suggestions: List[str] = Field(..., min_length=5) # Top 5 suggestions
    section_feedback: SectionFeedback

# Analysis record returned from database
class AnalysisHistoryItem(BaseModel):
    id: str
    timestamp: datetime.datetime
    resume_snippet: str
    ats_score: int
    keyword_score: int
    format_score: int
    # We allow full_response to be returned as the ClaudeAnalysisResult structure
    full_response: ClaudeAnalysisResult

    class Config:
        from_attributes = True

# Compare Resumes structures
class SingleResumeCompareResult(BaseModel):
    filename: str
    scores: Dict[str, int]  # ats_score, keyword_score, format_score
    analysis: ClaudeAnalysisResult

class CompareResponse(BaseModel):
    resume_1: SingleResumeCompareResult
    resume_2: SingleResumeCompareResult
