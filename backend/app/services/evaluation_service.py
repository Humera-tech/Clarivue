
import re
from typing import Any

from app.services.retrieval_service import retrieve_relevant_chunks


CITATION_PATTERN = re.compile(
    r"\[Source\s+(\d+)(?:,\s*Page\s+\d+)?\]",
    re.IGNORECASE,
)


def evaluate_retrieval(
    *,
    question: str,
    document_id: int,
    top_k: int = 5,
) -> dict[str, Any]:
    """
    Evaluate retrieval behavior for a question without generating an answer.

    Cosine distance is a retrieval signal, not a calibrated relevance score.
    Lower distance indicates a closer embedding match.
    """
    chunks = retrieve_relevant_chunks(
        document_id=document_id,
        question=question,
        top_k=top_k,
    )

    distances = [
        float(chunk["distance"])
        for chunk in chunks
        if chunk.get("distance") is not None
    ]

    return {
        "document_id": document_id,
        "question": question,
        "requested_top_k": top_k,
        "retrieved_count": len(chunks),
        "has_evidence": bool(chunks),
        "retrieved_chunks": [
            {
                "chunk_id": chunk["chunk_id"],
                "page_number": chunk["page_number"],
                "distance": chunk.get("distance"),
                "text_length": len(chunk.get("text", "")),
            }
            for chunk in chunks
        ],
        "mean_cosine_distance": (
            sum(distances) / len(distances) if distances else None
        ),
    }


def evaluate_citations(
    *,
    answer: str,
    source_count: int,
) -> dict[str, Any]:
    """
    Check whether citation labels point to source numbers that exist.

    This checks citation references only. It does not prove that a cited
    passage actually supports the associated claim.
    """
    citations = [
        int(match.group(1))
        for match in CITATION_PATTERN.finditer(answer)
    ]

    valid_citations = [
        number for number in citations
        if 1 <= number <= source_count
    ]

    invalid_citations = [
        number for number in citations
        if number < 1 or number > source_count
    ]

    return {
        "source_count": source_count,
        "citation_count": len(citations),
        "valid_citation_count": len(valid_citations),
        "invalid_citations": invalid_citations,
        "citation_references_valid": not invalid_citations,
        "has_citations": bool(citations),
    }
