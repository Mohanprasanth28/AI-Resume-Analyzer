import io
import datetime
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_pdf_report(analysis_data: Dict[str, Any], username: str) -> io.BytesIO:
    """
    Generates a beautifully typeset PDF report using ReportLab based on resume analysis data.
    Returns the report as an in-memory BytesIO stream.
    """
    # Create the buffer
    buffer = io.BytesIO()
    
    # Page setup
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Custom colors
    PRIMARY_COLOR = colors.HexColor("#1e293b")  # Slate 800
    ACCENT_COLOR = colors.HexColor("#0d9488")   # Teal 600
    TEXT_DARK = colors.HexColor("#334155")      # Slate 700
    BG_LIGHT = colors.HexColor("#f8fafc")       # Slate 50
    BORDER_COLOR = colors.HexColor("#cbd5e1")   # Slate 300
    RED_COLOR = colors.HexColor("#dc2626")      # Red 600
    GREEN_COLOR = colors.HexColor("#16a34a")    # Green 600
    
    # Define custom ParagraphStyles
    title_style = ParagraphStyle(
        name="DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=PRIMARY_COLOR,
        alignment=TA_LEFT,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        name="DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=ACCENT_COLOR,
        spaceAfter=15
    )
    
    heading1_style = ParagraphStyle(
        name="DocH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=PRIMARY_COLOR,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        name="DocBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        name="DocBullet",
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    score_label_style = ParagraphStyle(
        name="ScoreLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.white,
        alignment=TA_CENTER
    )
    
    score_num_style = ParagraphStyle(
        name="ScoreNum",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.white,
        alignment=TA_CENTER
    )

    # 1. Header / Cover section
    story.append(Paragraph("AI Resume Analyzer & Career Coach", title_style))
    story.append(Paragraph(f"ATS Compliance Review & Optimization Blueprint", subtitle_style))
    
    # Meta information table
    date_str = datetime.datetime.now().strftime("%B %d, %Y")
    meta_data = [
        [Paragraph(f"<b>Candidate User:</b> {username}", body_style), Paragraph(f"<b>Date Generated:</b> {date_str}", ParagraphStyle(name="RightBody", parent=body_style, alignment=TA_RIGHT))]
    ]
    meta_table = Table(meta_data, colWidths=[3.5*inch, 3.5*inch])
    meta_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-1), 1, ACCENT_COLOR),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # 2. Main Scores Grid
    ats_score = int(analysis_data.get("ats_score", 0))
    keyword_score = int(analysis_data.get("keyword_score", 0))
    format_score = int(analysis_data.get("format_score", 0))
    
    # Background colors based on scores
    def get_score_color(score: int):
        if score >= 80:
            return GREEN_COLOR
        elif score >= 60:
            return colors.HexColor("#d97706") # Amber 600
        else:
            return RED_COLOR
            
    score_data = [
        [
            Paragraph("ATS MATCH SCORE", score_label_style),
            Paragraph("KEYWORD SCORE", score_label_style),
            Paragraph("FORMAT SCORE", score_label_style)
        ],
        [
            Paragraph(f"{ats_score}/100", score_num_style),
            Paragraph(f"{keyword_score}/100", score_num_style),
            Paragraph(f"{format_score}/100", score_num_style)
        ]
    ]
    
    score_table = Table(score_data, colWidths=[2.33*inch, 2.33*inch, 2.33*inch])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), get_score_color(ats_score)),
        ('BACKGROUND', (1,0), (1,-1), get_score_color(keyword_score)),
        ('BACKGROUND', (2,0), (2,-1), get_score_color(format_score)),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 1, colors.white),
    ]))
    
    story.append(score_table)
    story.append(Spacer(1, 15))
    
    # 3. Score Breakdown Section
    story.append(Paragraph("Category Score Breakdown", heading1_style))
    breakdown_data = [["Section", "Score", "Rating"]]
    for item in analysis_data.get("score_breakdown", []):
        sec_name = item.get("section", "General")
        sec_score = int(item.get("score", 0))
        
        if sec_score >= 80:
            rating = "Excellent"
        elif sec_score >= 60:
            rating = "Needs Improvement"
        else:
            rating = "Critical Action Required"
            
        breakdown_data.append([
            Paragraph(f"<b>{sec_name}</b>", body_style),
            Paragraph(f"{sec_score}/100", body_style),
            Paragraph(rating, ParagraphStyle(name=f"Rating_{sec_name}", parent=body_style, textColor=get_score_color(sec_score)))
        ])
        
    breakdown_table = Table(breakdown_data, colWidths=[2.5*inch, 1.5*inch, 3*inch])
    breakdown_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
    ]))
    # Adjust header text color in table styles
    for i in range(3):
        breakdown_table.setStyle(TableStyle([
            ('TEXTCOLOR', (i,0), (i,0), colors.white)
        ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 15))
    
    # 4. Keyword Analysis
    story.append(Paragraph("Keyword Match Analysis", heading1_style))
    
    present_keywords = analysis_data.get("present_keywords", [])
    missing_keywords = analysis_data.get("missing_keywords", [])
    
    present_str = ", ".join(present_keywords) if present_keywords else "None identified"
    missing_str = ", ".join(missing_keywords) if missing_keywords else "None identified"
    
    keyword_table_data = [
        [Paragraph("<font color='green'><b>✔ Matched Keywords:</b></font>", body_style), Paragraph(present_str, body_style)],
        [Paragraph("<font color='red'><b>✘ Missing Keywords:</b></font>", body_style), Paragraph(missing_str, body_style)]
    ]
    
    keyword_table = Table(keyword_table_data, colWidths=[2.0*inch, 5.0*inch])
    keyword_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, BORDER_COLOR),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
    ]))
    story.append(keyword_table)
    story.append(Spacer(1, 15))
    
    # 5. Section Feedback Accordion
    story.append(Paragraph("Detailed Section-by-Section Feedback", heading1_style))
    feedback = analysis_data.get("section_feedback", {})
    
    feedback_data = []
    for section_key in ["summary", "experience", "skills", "education"]:
        title = section_key.capitalize()
        content = feedback.get(section_key, "No specific feedback provided.")
        feedback_data.append([
            Paragraph(f"<b>{title}</b>", ParagraphStyle(name=f"FTitle_{section_key}", parent=body_style, fontName="Helvetica-Bold", textColor=PRIMARY_COLOR)),
            Paragraph(content, body_style)
        ])
        
    feedback_table = Table(feedback_data, colWidths=[1.5*inch, 5.5*inch])
    feedback_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-2), 0.5, BORDER_COLOR),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
    ]))
    story.append(feedback_table)
    
    # Force Page Break for Bullet Improvements and Suggestions
    story.append(PageBreak())
    
    # 6. Weak Bullet Improvements
    story.append(Paragraph("Impact & Bullet Point Optimization", heading1_style))
    story.append(Paragraph("A crucial element of ATS parsing is action-verb density and quantitative impact representation. Below are suggested rewrites for identified weaker segments:", body_style))
    story.append(Spacer(1, 6))
    
    weak_bullets = analysis_data.get("weak_bullets", [])
    if not weak_bullets:
        story.append(Paragraph("<i>No weak bullet points were identified. Excellent job crafting impact statements!</i>", body_style))
    else:
        bullets_table_data = [[Paragraph("<b>Original Statement</b>", body_style), Paragraph("<b>ATS Optimized Statement</b>", body_style)]]
        
        for idx, bullet_item in enumerate(weak_bullets):
            orig = bullet_item.get("original", "")
            rewr = bullet_item.get("rewritten", "")
            
            bullets_table_data.append([
                Paragraph(f"<font color='red'>• {orig}</font>", body_style),
                Paragraph(f"<font color='green'><b>• {rewr}</b></font>", body_style)
            ])
            
        bullets_table = Table(bullets_table_data, colWidths=[3.4*inch, 3.6*inch])
        bullets_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY_COLOR),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('BACKGROUND', (0,1), (-1,-1), BG_LIGHT),
            ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ]))
        # Change title text colors to white
        bullets_table.setStyle(TableStyle([
            ('TEXTCOLOR', (0,0), (1,0), colors.white)
        ]))
        story.append(bullets_table)
        
    story.append(Spacer(1, 15))
    
    # 7. Action Plan / Top Suggestions
    story.append(Paragraph("Immediate Career Action Plan (Top 5 Suggestions)", heading1_style))
    
    suggestions = analysis_data.get("top_suggestions", [])
    for idx, suggestion in enumerate(suggestions):
        num_prefix = f"<b>{idx+1}.</b> "
        story.append(Paragraph(f"{num_prefix}{suggestion}", bullet_style))
        story.append(Spacer(1, 4))
        
    if not suggestions:
        story.append(Paragraph("No suggestions generated.", body_style))
        
    # Build the document
    doc.build(story)
    
    # Seek to beginning of buffer
    buffer.seek(0)
    return buffer
