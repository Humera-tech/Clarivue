
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.document_comparision_service import compare_documents
router = APIRouter(prefix="/comparison", tags=["Document Comparison"])


@router.post("")
def compare_documents_endpoint(
    document_id_1: int = Query(..., gt=0),
    document_id_2: int = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return compare_documents(
        db,
        user_id=current_user.id,
        document_id_1=document_id_1,
        document_id_2=document_id_2,
    )
