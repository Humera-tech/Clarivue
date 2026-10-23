import logging
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.document import Document
from app.repositories.document_repository import (
    create_document,
    delete_document_record,
    get_document_by_id,
)
from app.utils.file_validation import validate_upload

logger = logging.getLogger(__name__)

CHUNK_SIZE = 1024 * 1024


async def upload_document(
    db: Session,
    *,
    user_id: int,
    file: UploadFile,
) -> Document:
    await validate_upload(file)

    original_filename = Path(file.filename or "document").name
    extension = Path(original_filename).suffix.lower()

    # Generate a unique filename to prevent collisions and path traversal.
    stored_filename = f"{uuid4().hex}{extension}"

    upload_directory = Path(settings.UPLOAD_DIR).resolve()
    upload_directory.mkdir(parents=True, exist_ok=True)

    destination = upload_directory / stored_filename
    total_size = 0

    try:
        await file.seek(0)

        with destination.open("wb") as output:
            while True:
                chunk = await file.read(CHUNK_SIZE)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="The file exceeds the maximum allowed size.",
                    )

                output.write(chunk)

        document = create_document(
            db,
            user_id=user_id,
            filename=original_filename,
            file_type=extension.lstrip("."),
            file_size=total_size,
            storage_path=str(destination),
            status="uploaded",
        )

        return document

    except HTTPException:
        destination.unlink(missing_ok=True)
        raise

    except Exception:
        destination.unlink(missing_ok=True)
        logger.exception("Document upload failed")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be saved.",
        )

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

    # Resolve and validate the path before touching the filesystem.
    upload_directory = Path(settings.UPLOAD_DIR).resolve()
    stored_path = Path(document.storage_path).resolve()

    if not stored_path.is_relative_to(upload_directory):
        logger.error(
            "Refusing to delete document %s: storage path is outside upload directory",
            document.id,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be deleted safely.",
        )

    # Remove the database record first. If this fails, the file is untouched.
    try:
        delete_document_record(db, document=document)
    except Exception:
        db.rollback()
        logger.exception("Could not delete document record %s", document_id)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The document could not be deleted.",
        )

    # The database deletion succeeded. Remove the stored file as well.
    try:
        stored_path.unlink(missing_ok=True)
    except OSError:
        # The database record is already gone; log any leftover file for cleanup.
        logger.exception(
            "Document %s was deleted from the database, "
            "but its stored file could not be removed",
            document_id,
        )