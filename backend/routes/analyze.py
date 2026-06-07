import logging
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.analysis_model import User, Analysis, ClaudeAnalysisResult, CompareResponse, SingleResumeCompareResult
from routes.auth import get_current_user
from services.pdf_parser import extract_text_from_pdf
from services.claude_service import analyze_resume_with_claude

logger = logging.getLogger("resume_analyzer.routes.analyze")

router = APIRouter(tags=["Analysis"])

@router.post("/analyze", response_model=ClaudeAnalysisResult)
async def analyze_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyzes a resume against a job description.
    Accepts either a PDF file upload or direct text paste.
    Runs the analysis through Anthropic Claude and saves the result to database.
    """
    logger.info(f"Analysis requested by user '{current_user.username}'")
    
    # 1. Resolve Resume Text
    final_resume_text = ""
    filename_hint = "manual_paste.txt"
    
    if file is not None:
        filename_hint = file.filename
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF format is supported for file uploads."
            )
        try:
            file_bytes = await file.read()
            final_resume_text = extract_text_from_pdf(file_bytes, file.filename)
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.error(f"Error parsing PDF file: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while reading the PDF file: {str(e)}"
            )
    elif resume_text:
        final_resume_text = resume_text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a resume by either uploading a PDF or pasting the text."
        )

    if not final_resume_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The resume content is empty."
        )
        
    if not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )

    # 2. Run Claude Analysis
    analysis_raw = analyze_resume_with_claude(final_resume_text, job_description)
    
    # Validate result with Pydantic
    try:
        validated_analysis = ClaudeAnalysisResult(**analysis_raw)
    except Exception as pe:
        logger.error(f"Pydantic validation of Claude response failed: {str(pe)}")
        # If there's an error, we attempt to parse it anyway or format it safely
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI response did not match the required formatting constraints: {str(pe)}"
        )

    # 3. Persist to MySQL Database
    # Generate snippet (first 150 chars) for display
    snippet = final_resume_text[:150] + "..." if len(final_resume_text) > 150 else final_resume_text
    
    db_analysis = Analysis(
        user_id=current_user.id,
        resume_snippet=snippet,
        resume_text=final_resume_text,
        job_description=job_description,
        ats_score=validated_analysis.ats_score,
        keyword_score=validated_analysis.keyword_score,
        format_score=validated_analysis.format_score,
        full_response=analysis_raw  # SQLAlchemy automatically serializes dict to JSON type in MySQL
    )
    
    try:
        db.add(db_analysis)
        db.commit()
        db.refresh(db_analysis)
        logger.info(f"Analysis saved successfully. ID: {db_analysis.id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving analysis to MySQL: {str(e)}")
        # We still return the analysis even if DB writing failed so that the user gets their result
        logger.warning("Returning analysis result without saving to history database.")
        
    return validated_analysis


@router.post("/compare", response_model=CompareResponse)
async def compare_resumes(
    file1: Optional[UploadFile] = File(None),
    resume_text1: Optional[str] = Form(None),
    file2: Optional[UploadFile] = File(None),
    resume_text2: Optional[str] = Form(None),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Compares two resumes side-by-side against the same job description.
    Extracts text for both, executes analysis on each, saves both to history,
    and returns a side-by-side score/detail comparison report.
    """
    logger.info(f"Resume comparison requested by user '{current_user.username}'")
    
    # 1. Resolve Resume 1 Text
    filename1 = "Resume 1"
    text1 = ""
    if file1 is not None:
        filename1 = file1.filename
        file_bytes1 = await file1.read()
        text1 = extract_text_from_pdf(file_bytes1, filename1)
    elif resume_text1:
        text1 = resume_text1.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide the first resume."
        )
        
    # 2. Resolve Resume 2 Text
    filename2 = "Resume 2"
    text2 = ""
    if file2 is not None:
        filename2 = file2.filename
        file_bytes2 = await file2.read()
        text2 = extract_text_from_pdf(file_bytes2, filename2)
    elif resume_text2:
        text2 = resume_text2.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide the second resume."
        )
        
    if not text1 or not text2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both resumes must have text content."
        )

    # 3. Analyze Resume 1
    logger.info("Analyzing resume 1...")
    analysis_raw_1 = analyze_resume_with_claude(text1, job_description)
    validated1 = ClaudeAnalysisResult(**analysis_raw_1)
    
    snippet1 = text1[:150] + "..." if len(text1) > 150 else text1
    db_analysis1 = Analysis(
        user_id=current_user.id,
        resume_snippet=f"[Compare: {filename1}] {snippet1}",
        resume_text=text1,
        job_description=job_description,
        ats_score=validated1.ats_score,
        keyword_score=validated1.keyword_score,
        format_score=validated1.format_score,
        full_response=analysis_raw_1
    )
    
    # 4. Analyze Resume 2
    logger.info("Analyzing resume 2...")
    analysis_raw_2 = analyze_resume_with_claude(text2, job_description)
    validated2 = ClaudeAnalysisResult(**analysis_raw_2)
    
    snippet2 = text2[:150] + "..." if len(text2) > 150 else text2
    db_analysis2 = Analysis(
        user_id=current_user.id,
        resume_snippet=f"[Compare: {filename2}] {snippet2}",
        resume_text=text2,
        job_description=job_description,
        ats_score=validated2.ats_score,
        keyword_score=validated2.keyword_score,
        format_score=validated2.format_score,
        full_response=analysis_raw_2
    )
    
    # Save both to DB
    try:
        db.add(db_analysis1)
        db.add(db_analysis2)
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error saving comparison analyses to MySQL: {str(e)}")
        
    # Build comparison response
    result1 = SingleResumeCompareResult(
        filename=filename1,
        scores={
            "ats_score": validated1.ats_score,
            "keyword_score": validated1.keyword_score,
            "format_score": validated1.format_score
        },
        analysis=validated1
    )
    
    result2 = SingleResumeCompareResult(
        filename=filename2,
        scores={
            "ats_score": validated2.ats_score,
            "keyword_score": validated2.keyword_score,
            "format_score": validated2.format_score
        },
        analysis=validated2
    )
    
    return CompareResponse(
        resume_1=result1,
        resume_2=result2
    )
