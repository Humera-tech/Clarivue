from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.document_repository import list_documents
from app.schemas.document import DocumentResponse
from app.services.document_service import (
    delete_document,
    upload_document,
)

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_document_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentResponse:
    document = await upload_document(
        db,
        user_id=current_user.id,
        file=file,
    )

    return DocumentResponse.model_validate(document)


@router.get(
    "",
    response_model=list[DocumentResponse],
)
def get_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    documents = list_documents(
        db,
        user_id=current_user.id,
    )

    return [
        DocumentResponse.model_validate(document)
        for document in documents
    ]


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    delete_document(
        db,
        document_id=document_id,
        user_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)