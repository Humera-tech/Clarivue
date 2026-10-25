
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.models.user import User
from app.repositories.document_repository import list_documents
from app.schemas.dashboard import DashboardStatisticsResponse
from app.schemas.document import DocumentResponse
from app.schemas.document_summary import DocumentSummaryResponse
from app.services.dashboard_service import get_dashboard_statistics
from app.services.document_activity_service import log_document_activity
from app.services.document_management_service import rename_document
from app.services.document_reprocessing_service import reprocess_document
from app.services.document_search_service import search_documents
from app.services.document_service import delete_document, upload_document
from app.services.document_summary_service import summarize_document

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

    try:
        log_document_activity(
            db,
            user_id=current_user.id,
            document_id=document.id,
            action="uploaded",
            details=f"Uploaded document: {document.filename}",
        )
        db.commit()
    except Exception:
        db.rollback()
        # Activity logging should not make a successful upload fail.
        import logging
        logging.getLogger(__name__).exception(
            "Failed to log document upload activity."
        )

    return DocumentResponse.model_validate(document)


@router.get("", response_model=list[DocumentResponse])
def get_documents(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[DocumentResponse]:
    statement = (
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.id.desc())
        .offset(offset)
        .limit(limit)
    )

    documents = db.scalars(statement).all()

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


@router.post("/{document_id}/reprocess")
def reprocess_document_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = reprocess_document(
        db,
        document_id=document_id,
        user_id=current_user.id,
    )

    try:
        log_document_activity(
            db,
            user_id=current_user.id,
            document_id=document.id,
            action="reprocessed",
            details=f"Reprocessed document: {document.filename}",
        )
        db.commit()
    except Exception:
        db.rollback()
        import logging
        logging.getLogger(__name__).exception(
            "Failed to log document reprocessing activity."
        )

    return {
        "message": "Document reprocessed successfully.",
        "document_id": document.id,
        "filename": document.filename,
        "status": document.status,
    }


@router.get("/search", tags=["Document Search"])
def search_documents_endpoint(
    q: str = Query(..., min_length=1, max_length=200),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    results = search_documents(
        db,
        user_id=current_user.id,
        query=q,
        limit=limit,
    )

    return {
        "query": q,
        "count": len(results),
        "results": results,
    }


@router.get("/{document_id}/details", tags=["Document Details"])
def get_document_details(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    chunk_count = db.scalar(
        select(func.count())
        .select_from(DocumentChunk)
        .where(DocumentChunk.document_id == document.id)
    )

    return {
        "id": document.id,
        "filename": document.filename,
        "status": document.status,
        "chunk_count": chunk_count or 0,
        "created_at": document.created_at,
    }


@router.post(
    "/{document_id}/summary",
    response_model=DocumentSummaryResponse,
    tags=["Document Summary"],
)
def summarize_document_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DocumentSummaryResponse:
    return DocumentSummaryResponse.model_validate(
        summarize_document(
            db,
            document_id=document_id,
            user_id=current_user.id,
        )
    )


@router.get(
    "/dashboard/statistics",
    response_model=DashboardStatisticsResponse,
    tags=["Dashboard"],
)
def get_dashboard_statistics_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardStatisticsResponse:
    return DashboardStatisticsResponse.model_validate(
        get_dashboard_statistics(
            db,
            user_id=current_user.id,
        )
    )


@router.get("/{document_id}/export", tags=["Document Export"])
def export_document_text(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = db.scalar(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    if document.status != "processed":
        raise HTTPException(
            status_code=422,
            detail="Document is not ready for export.",
        )

    if not document.extracted_text:
        raise HTTPException(
            status_code=404,
            detail="No extracted text is available.",
        )

    filename = f"{document.filename.rsplit('.', 1)[0]}.txt"

    return PlainTextResponse(
        content=document.extracted_text,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )


class RenameDocumentRequest(BaseModel):
    filename: str = Field(min_length=1, max_length=255)


@router.patch("/{document_id}/rename", response_model=DocumentResponse)
def rename_document_endpoint(
    document_id: int,
    payload: RenameDocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = rename_document(
        db,
        document_id=document_id,
        user_id=current_user.id,
        new_filename=payload.filename,
    )

    return DocumentResponse.model_validate(document)


from app.services.document_version_service import get_document_version_history


@router.get("/{document_id}/history", tags=["Document History"])
def get_document_history_endpoint(
    document_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_document_version_history(
        db,
        document_id=document_id,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )

from app.services.analysis_service import analyze_document

@router.post("/{document_id}/analyze", tags=["Document Analysis"])
def analyze_document_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analyze_document(
        db,
        document_id=document_id,
        user_id=current_user.id,
    )

from app.services.key_points_service import extract_key_points

@router.post("/{document_id}/key-points", tags=["Document Analysis"])
def extract_key_points_endpoint(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return extract_key_points(
        db,
        document_id=document_id,
        user_id=current_user.id,
    )
