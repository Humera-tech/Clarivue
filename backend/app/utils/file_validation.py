
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings


ALLOWED_EXTENSIONS = {
    ".pdf": {"application/pdf"},
    ".docx": {
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    },
    ".txt": {
        "text/plain",
    },
}


async def validate_upload(file: UploadFile) -> None:
    """
    Validate an uploaded document's extension, MIME type, and size.

    Note:
        MIME types and extensions are not sufficient to prove that a
        file's contents are safe. Content-level validation will be
        performed during document processing.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A filename is required.",
        )

    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Upload a PDF, DOCX, or TXT file.",
        )

    if file.content_type not in ALLOWED_EXTENSIONS[extension]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file's content type does not match its extension.",
        )

    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total_size = 0

    try:
        while True:
            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            total_size += len(chunk)

            if total_size > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=(
                        f"File exceeds the maximum allowed size of "
                        f"{settings.MAX_UPLOAD_SIZE_MB} MB."
                    ),
                )

        if total_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty.",
            )

    finally:
        await file.seek(0)
