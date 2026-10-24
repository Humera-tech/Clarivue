
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.document_chunk import DocumentChunk


def create_document(
    db: Session,
    *,
    user_id: int,
    filename: str,
    file_type: str,
    file_size: int,
    storage_path: str,
    extracted_text: str | None = None,
    status: str = "uploaded",
    chunks: list[dict] | None = None,
) -> Document:
    document = Document(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        file_size=file_size,
        storage_path=storage_path,
        extracted_text=extracted_text,
        status=status,
    )

    try:
        db.add(document)
        db.flush()

        for chunk_data in chunks or []:
            db.add(
                DocumentChunk(
                    document_id=document.id,
                    page_number=chunk_data["page_number"],
                    start_char=chunk_data["start_char"],
                    end_char=chunk_data["end_char"],
                    text=chunk_data["text"],
                )
            )

        db.commit()
        db.refresh(document)
        return document

    except Exception:
        db.rollback()
        raise


def get_document_by_id(
    db: Session,
    *,
    document_id: int,
    user_id: int,
) -> Document | None:
    statement = select(Document).where(
        Document.id == document_id,
        Document.user_id == user_id,
    )
    return db.scalar(statement)


def list_documents(
    db: Session,
    *,
    user_id: int,
) -> list[Document]:
    statement = (
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
    )
    return list(db.scalars(statement).all())


def delete_document_record(
    db: Session,
    *,
    document: Document,
) -> None:
    try:
        db.delete(document)
        db.commit()
    except Exception:
        db.rollback()
        raise
