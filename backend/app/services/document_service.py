
import logging
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.ingestion.chunker import chunk_pages
from app.ingestion.pdf_extractor import extract_pdf_pages
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.repositories.document_repository import (
    create_document,
    delete_document_record,
    get_document_by_id,
)
from app.rag.vector_store import delete_document_index, index_chunks
from app.utils.file_validation import validate_upload

logger = logging.getLogger(__name__)

UPLOAD_CHUNK_SIZE = 1024 * 1024
TEXT_CHUNK_SIZE = 1000
TEXT_CHUNK_OVERLAP = 150


async def upload_document(
    db: Session,
    *,
    user_id: int,
    file: UploadFile,
) -> Document:
    await validate_upload(file)

    original_filename = Path(file.filename or "document").name
    extension = Path(original_filename).suffix.lower()
    stored_filename = f"{uuid4().hex}{extension}"

    upload_directory = Path(settings.UPLOAD_DIR).resolve()
    upload_directory.mkdir(parents=True, exist_ok=True)

    destination = upload_directory / stored_filename
    total_size = 0
    chunks: list[dict] = []

    try:
        await file.seek(0)

        with destination.open("wb") as output:
            while True:
                data = await file.read(UPLOAD_CHUNK_SIZE)
                if not data:
                    break

                total_size += len(data)

                if total_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="The file exceeds the maximum allowed size.",
                    )

                output.write(data)

        extracted_text = None
        document_status = "uploaded"

        if extension == ".pdf":
            try:
                pages = extract_pdf_pages(destination)

                chunks = chunk_pages(
                    pages,
                    chunk_size=TEXT_CHUNK_SIZE,
                    overlap=TEXT_CHUNK_OVERLAP,
                )

                logger.info(
                    "Extracted %d pages and generated %d chunks for %s",
                    len(pages),
                    len(chunks),
                    original_filename,
                )

                if not chunks:
                    raise ValueError(
                        "No text chunks could be created from this PDF."
                    )

                extracted_text = "\n\n".join(
                    f"[Page {page['page_number']}]\n{page['text']}"
                    for page in pages
                    if page["text"].strip()
                )
                document_status = "processed"

            except (ValueError, FileNotFoundError) as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=str(exc),
                ) from exc

            except Exception as exc:
                logger.exception(
                    "PDF processing failed: %s",
                    original_filename,
                )
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="The PDF could not be processed.",
                ) from exc

        document = create_document(
            db,
            user_id=user_id,
            filename=original_filename,
            file_type=extension.lstrip("."),
            file_size=total_size,
            storage_path=str(destination),
            extracted_text=extracted_text,
            status=document_status,
            chunks=chunks,
        )

        if chunks:
            try:
                saved_chunks = db.scalars(
                    select(DocumentChunk)
                    .where(DocumentChunk.document_id == document.id)
                    .order_by(DocumentChunk.id)
                ).all()

                persisted_chunks = [
                    {
                        "id": chunk.id,
                        "text": chunk.text,
                        "page_number": chunk.page_number,
                    }
                    for chunk in saved_chunks
                ]

                indexed_count = index_chunks(
                    document_id=document.id,
                    chunks=persisted_chunks,
                )

                logger.info(
                    "Indexed %d of %d saved chunks for document %d",
                    indexed_count,
                    len(persisted_chunks),
                    document.id,
                )

                if indexed_count != len(persisted_chunks):
                    logger.warning(
                        "Some chunks for document %d were not indexed",
                        document.id,
                    )

            except Exception:
                logger.exception(
                    "Document %d was saved, but vector indexing failed",
                    document.id,
                )

        return document

    except HTTPException:
        destination.unlink(missing_ok=True)
        raise

    except Exception as exc:
        destination.unlink(missing_ok=True)
        db.rollback()
        logger.exception("Document upload failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be saved.",
        ) from exc

    finally:
        await file.close()


def delete_document(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> None:
    document = get_document_by_id(
        db,
        document_id=document_id,
        user_id=user_id,
    )

    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    upload_directory = Path(settings.UPLOAD_DIR).resolve()
    stored_path = Path(document.storage_path).resolve()

    if not stored_path.is_relative_to(upload_directory):
        logger.error(
            "Refusing to delete document %s: path is outside upload directory",
            document.id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be deleted safely.",
        )

    document_id_to_delete = document.id

    try:
        delete_document_record(db, document=document)
    except Exception as exc:
        logger.exception(
            "Could not delete document record %s",
            document_id_to_delete,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be deleted.",
        ) from exc

    try:
        delete_document_index(document_id_to_delete)
    except Exception:
        logger.exception(
            "Document %d was deleted from PostgreSQL, "
            "but its vector index could not be removed",
            document_id_to_delete,
        )

    try:
        stored_path.unlink(missing_ok=True)
    except OSError:
        logger.exception(
            "Document %d was deleted from the database, "
            "but its stored file could not be removed",
            document_id_to_delete,
        )
