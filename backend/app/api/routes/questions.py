
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.question import QuestionRequest, QuestionResponse
from app.services.question_service import answer_document_question

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.post("/ask", response_model=QuestionResponse)
def ask_document_question(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> QuestionResponse:
    return answer_document_question(
        db,
        user_id=current_user.id,
        request=request,
    )
