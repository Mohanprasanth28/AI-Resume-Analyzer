import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from models.analysis_model import User, Analysis, AnalysisHistoryItem
from routes.auth import get_current_user
from services.report_generator import generate_pdf_report

logger = logging.getLogger("resume_analyzer.routes.history")

router = APIRouter(tags=["History & Reports"])

@router.get("/history", response_model=List[AnalysisHistoryItem])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all previous analyses performed by the authenticated user."""
    logger.info(f"Retrieving analysis history list for user '{current_user.username}'")
    analyses = db.query(Analysis).filter(Analysis.user_id == current_user.id).order_by(Analysis.timestamp.desc()).all()
    return analyses


@router.get("/history/{analysis_id}", response_model=AnalysisHistoryItem)
def get_analysis_detail(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves the full details of a specific past resume analysis."""
    logger.info(f"Retrieving analysis detail: {analysis_id} for user '{current_user.username}'")
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested analysis record was not found or you do not have permission to view it."
        )
    return analysis


@router.delete("/history/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes an analysis record from the user's history."""
    logger.info(f"Deleting analysis: {analysis_id} for user '{current_user.username}'")
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The analysis record could not be found or you do not have permission to delete it."
        )
        
    try:
        db.delete(analysis)
        db.commit()
        logger.info(f"Analysis {analysis_id} successfully deleted.")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete analysis {analysis_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the analysis record from the database."
        )
        
    return None


@router.get("/report/{analysis_id}")
def download_pdf_report(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates and downloads a beautifully compiled ReportLab PDF report
    for the specified analysis record.
    """
    logger.info(f"Generating PDF report for analysis: {analysis_id} (Requested by: '{current_user.username}')")
    
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not generate report. The analysis record was not found."
        )
        
    try:
        # Full response is saved as dict in DB (SQLAlchemy JSON column mapping)
        analysis_data = analysis.full_response
        
        # In-memory pdf buffer
        pdf_buffer = generate_pdf_report(analysis_data, current_user.username)
        
        filename = f"ATS_Report_{analysis_id[:8]}.pdf"
        
        # Return StreamingResponse back to the client
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Access-Control-Expose-Headers": "Content-Disposition"  # Crucial for browser downloads
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate/stream PDF report for analysis {analysis_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while building the PDF report: {str(e)}"
        )
