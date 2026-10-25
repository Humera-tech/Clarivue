
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.services.document_activity_service import get_document_activity

router = APIRouter(prefix="/activity", tags=["Activity"])


class ActivityResponse(BaseModel):
    id: int
    document_id: int | None
    action: str
    details: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get("", response_model=list[ActivityResponse])
def get_activity(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    activities = get_document_activity(
        db,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )

    return [
        ActivityResponse.model_validate(activity)
        for activity in activities
    ]
