from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.document import Document


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

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


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
    db.delete(document)
    db.commit()