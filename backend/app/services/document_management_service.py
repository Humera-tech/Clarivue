
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.services.document_activity_service import log_document_activity


def rename_document(
    db: Session,
    *,
    document_id: int,
    user_id: int,
    new_filename: str,
) -> Document:
    new_filename = new_filename.strip()

    if not new_filename:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Filename cannot be empty.",
        )

    if len(new_filename) > 255:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Filename cannot exceed 255 characters.",
        )

    if any(char in new_filename for char in ("/", "\\", "\0")):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Filename cannot contain path separators.",
        )

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

    # Preserve the original file extension.
    original_extension = (
        "." + document.filename.rsplit(".", 1)[1]
        if "." in document.filename
        else ""
    )

    if original_extension and not new_filename.lower().endswith(
        original_extension.lower()
    ):
        new_filename += original_extension

    # Update the filename.
    document.filename = new_filename

    # Record the rename in the activity log.
    log_document_activity(
        db,
        user_id=user_id,
        document_id=document.id,
        action="renamed",
        details=f"Document renamed to {new_filename}",
    )

    # Save both changes together.
    try:
        db.commit()
        db.refresh(document)
    except Exception:
        db.rollback()
        raise

    return document
