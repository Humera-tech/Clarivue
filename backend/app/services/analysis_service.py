            
import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.llm_service import generate_grounded_answer

logger = logging.getLogger(__name__)

MAX_ANALYSIS_CHARS = 24000


def analyze_document(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> dict:
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user_id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if document.status != "processed":
        raise HTTPException(
            status_code=422,
            detail="Document must be processed before analysis.",
        )

    text = document.extracted_text or ""

    if not text.strip():
        raise HTTPException(
            status_code=422,
            detail="The document contains no extracted text.",
        )

    truncated = len(text) > MAX_ANALYSIS_CHARS
    context = text[:MAX_ANALYSIS_CHARS]

    question = """
Analyze the supplied document using only its contents.

Produce a clearly structured report with these headings:

1. EXECUTIVE SUMMARY
Summarize the document's purpose and main message.

2. KEY INSIGHTS
List the most important findings, arguments, or takeaways.

3. IMPORTANT ENTITIES
Identify relevant people, organizations, products, or other named entities.
Do not invent missing details.

4. IMPORTANT DATES AND FIGURES
Report significant dates, numbers, amounts, percentages, and deadlines.
Preserve the original values and units.

5. RISKS AND CONCERNS
Identify explicitly stated risks, limitations, contradictions, or concerns.
If none are evident, say that the document does not establish any.

6. OPEN QUESTIONS
List important information that is missing or ambiguous.

7. CONCLUSION
Explain the document's overall significance.

Cite factual claims using [Source 1], [Source 2], etc., corresponding to
the supplied evidence. If the evidence does not support a claim, do not
present it as fact. Clearly distinguish explicit statements from
reasonable interpretations. Never invent citations or information.
"""

    try:
        analysis = generate_grounded_answer(
            question=question,
            context=f"[Source 1: {document.filename}]\n{context}",
        )
    except Exception:
        logger.exception(
            "Document analysis failed for document %s",
            document_id,
        )
        raise HTTPException(
            status_code=502,
            detail="Document analysis is temporarily unavailable.",
        )

    return {
        "document_id": document.id,
        "filename": document.filename,
        "analysis": analysis,
        "characters_analyzed": len(context),
        "truncated": truncated,
    }
