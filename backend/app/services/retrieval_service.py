
import logging
from typing import Any

from fastapi import HTTPException

from app.rag.vector_store import search_chunks

logger = logging.getLogger(__name__)

DEFAULT_TOP_K = 5
MAX_TOP_K = 20

# Chroma cosine distance: lower is more similar.
# This is a configurable starting threshold, not a calibrated relevance score.
MAX_COSINE_DISTANCE = 0.65


def retrieve_relevant_chunks(
    *,
    document_id: int,
    question: str,
    top_k: int = DEFAULT_TOP_K,
) -> list[dict[str, Any]]:
    question = question.strip()

    if not question:
        raise HTTPException(
            status_code=422,
            detail="Question cannot be empty.",
        )

    if not 1 <= top_k <= MAX_TOP_K:
        raise HTTPException(
            status_code=422,
            detail=f"top_k must be between 1 and {MAX_TOP_K}.",
        )

    try:
        chunks = search_chunks(
            query=question,
            document_id=document_id,
            top_k=top_k,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Relevant chunk retrieval failed.")
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve relevant document passages.",
        ) from exc

    # Lower cosine distance means a closer semantic match.
    # Keep this threshold configurable until evaluated on real questions.
    relevant_chunks = [
        chunk
        for chunk in chunks
        if chunk.get("distance") is not None
        and chunk["distance"] <= MAX_COSINE_DISTANCE
        and str(chunk.get("text", "")).strip()
    ]

    return relevant_chunks
