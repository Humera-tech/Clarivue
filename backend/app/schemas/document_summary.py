
from pydantic import BaseModel, ConfigDict, Field


class DocumentSummaryResponse(BaseModel):
    document_id: int
    filename: str
    summary: str = Field(min_length=1)
    chunks_used: int = Field(ge=0)
    total_chunks: int = Field(ge=0)

    model_config = ConfigDict(extra="forbid")
