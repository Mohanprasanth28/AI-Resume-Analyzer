# pyrefly: ignore [missing-import]
import fitz  # PyMuPDF
import logging
from fastapi import HTTPException, status

logger = logging.getLogger("resume_analyzer.pdf_parser")

def extract_text_from_pdf(file_bytes: bytes, filename: str = "uploaded_file.pdf") -> str:
    """
    Extracts plain text from a PDF byte stream.
    Validates file integrity and ensures readable content is extracted.
    """
    if not file_bytes:
        logger.error(f"Empty PDF upload attempt for {filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty."
        )
    
    try:
        # Open PDF from byte stream
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as e:
        logger.error(f"Corrupted PDF or extraction crash for {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to parse PDF. The file may be corrupted or is not a valid PDF document."
        )
        
    extracted_text = []
    
    try:
        # Iterate pages and pull plain text
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text:
                extracted_text.append(text)
        
        doc.close()
    except Exception as e:
        logger.error(f"Error during reading pages of {filename}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An error occurred while parsing the pages of the PDF file."
        )
        
    # Join and clean spaces
    full_text = "\n".join(extracted_text).strip()
    
    # Validation check: Is it empty or scanned?
    if not full_text:
        logger.warning(f"No readable text extracted from {filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text was found in the PDF. It may be empty or contain only scanned images/graphs. Please upload a text-based PDF or copy/paste the text manually."
        )
        
    if len(full_text) < 100:
        logger.warning(f"Very short text extracted from {filename} ({len(full_text)} chars)")
        # We still allow it, but log it as a warning or check if it's too short to analyze
        
    return full_text
