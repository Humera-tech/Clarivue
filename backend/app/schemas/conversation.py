from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ConversationResponse(BaseModel):
    id: int
    document_id: int | None
    question: str
    answer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)