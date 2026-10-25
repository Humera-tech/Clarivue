import logging

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.ingestion.chunker import chunk_pages
from app.ingestion.pdf_extractor import extract_document_pages
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.rag.vector_store import delete_document_index, index_chunks

logger = logging.getLogger(__name__)

TEXT_CHUNK_SIZE = 1000
TEXT_CHUNK_OVERLAP = 150


def reprocess_document(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> Document:
    """Re-extract, rechunk, and reindex a user's existing document."""

    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == user_id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    try:
        pages = extract_document_pages(document.storage_path)

        chunks = chunk_pages(
            pages,
            chunk_size=TEXT_CHUNK_SIZE,
            overlap=TEXT_CHUNK_OVERLAP,
        )

        if not chunks:
            raise ValueError("No text could be extracted from this document.")

        extracted_text = "\n\n".join(
            f"[Page {page['page_number']}]\n{page['text']}"
            for page in pages
            if page["text"].strip()
        )

        # Remove the old vector index before rebuilding it.
        delete_document_index(document.id)

        # Replace old database chunks.
        db.execute(
            delete(DocumentChunk).where(
                DocumentChunk.document_id == document.id
            )
        )

        for chunk in chunks:
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    page_number=chunk["page_number"],
                    start_char=chunk["start_char"],
                    end_char=chunk["end_char"],
                    text=chunk["text"],
                )
            )

        document.extracted_text = extracted_text
        document.status = "processing"
        db.commit()
        db.refresh(document)

        saved_chunks = db.scalars(
            select(DocumentChunk)
            .where(DocumentChunk.document_id == document.id)
            .order_by(DocumentChunk.id)
        ).all()

        indexed_count = index_chunks(
            document_id=document.id,
            chunks=[
                {
                    "id": chunk.id,
                    "text": chunk.text,
                    "page_number": chunk.page_number,
                }
                for chunk in saved_chunks
            ],
        )

        if indexed_count != len(saved_chunks):
            raise RuntimeError("Not all document chunks were indexed.")

        document.status = "processed"
        db.commit()
        db.refresh(document)

        return document

    except HTTPException:
        raise

    except Exception as exc:
        db.rollback()

        try:
            delete_document_index(document_id)
        except Exception:
            logger.exception(
                "Failed to clean up vector index for document %d",
                document_id,
            )

        logger.exception(
            "Reprocessing failed for document %d",
            document_id,
        )

        try:
            failed_document = db.scalar(
                select(Document).where(
                    Document.id == document_id,
                    Document.user_id == user_id,
                )
            )
            if failed_document is not None:
                failed_document.status = "failed"
                db.commit()
        except Exception:
            db.rollback()
            logger.exception("Could not persist document failure status")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document reprocessing failed.",
        ) from exc