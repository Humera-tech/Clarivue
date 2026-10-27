
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EvidenceItem(BaseModel):
    id: int
    document_id: int
    document_name: str
    page_number: int
    text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EvidenceResponse(BaseModel):
    total_evidence: int
    total_documents: int
    evidence: list[EvidenceItem]
