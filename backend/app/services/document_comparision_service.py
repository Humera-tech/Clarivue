
import logging

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.llm_service import generate_grounded_answer

logger = logging.getLogger(__name__)


def compare_documents(
    db: Session,
    *,
    user_id: int,
    document_id_1: int,
    document_id_2: int,
) -> dict:
    if document_id_1 == document_id_2:
        raise HTTPException(
            status_code=422,
            detail="Choose two different documents to compare.",
        )

    documents = db.scalars(
        select(Document).where(
            Document.user_id == user_id,
            Document.id.in_([document_id_1, document_id_2]),
        )
    ).all()

    by_id = {document.id: document for document in documents}

    first = by_id.get(document_id_1)
    second = by_id.get(document_id_2)

    if first is None or second is None:
        raise HTTPException(
            status_code=404,
            detail="One or both documents were not found.",
        )

    for document in (first, second):
        if document.status != "processed":
            raise HTTPException(
                status_code=422,
                detail=f"Document '{document.filename}' is not processed.",
            )

        if not document.extracted_text:
            raise HTTPException(
                status_code=422,
                detail=f"No extracted text is available for '{document.filename}'.",
            )

    # Limit context to keep the comparison request manageable.
    max_chars = 18000
    first_text = first.extracted_text[:max_chars]
    second_text = second.extracted_text[:max_chars]

    context = (
        f"[Document A: {first.filename}]\n"
        f"{first_text}\n\n"
        f"[Document B: {second.filename}]\n"
        f"{second_text}"
    )

    question = (
        "Compare Document A and Document B. Identify substantive differences, "
        "contradictions, changed figures or dates, and information present in "
        "one document but missing from the other. Organize the answer under "
        "clear headings. Cite evidence using [Source 1] for Document A and "
        "[Source 2] for Document B. If a comparison cannot be established "
        "from the provided text, say so. Do not invent differences."
    )

    try:
        comparison = generate_grounded_answer(
            question=question,
            context=context,
        )
    except Exception:
        logger.exception("Document comparison failed.")
        raise HTTPException(
            status_code=502,
            detail="Unable to compare documents right now.",
        )

    return {
        "document_a": {
            "id": first.id,
            "filename": first.filename,
        },
        "document_b": {
            "id": second.id,
            "filename": second.filename,
        },
        "comparison": comparison,
        "truncated": (
            len(first.extracted_text) > max_chars
            or len(second.extracted_text) > max_chars
        ),
    }
