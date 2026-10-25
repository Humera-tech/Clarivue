
from pydantic import BaseModel, ConfigDict, Field


class DashboardStatisticsResponse(BaseModel):
    total_documents: int = Field(ge=0)
    processed_documents: int = Field(ge=0)
    processing_documents: int = Field(ge=0)
    failed_documents: int = Field(ge=0)
    total_chunks: int = Field(ge=0)
    recent_uploads_last_7_days: int = Field(ge=0)

    model_config = ConfigDict(extra="forbid")
