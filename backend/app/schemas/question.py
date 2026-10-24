
from pydantic import BaseModel, Field, ConfigDict


class QuestionRequest(BaseModel):
    document_id: int = Field(gt=0)
    question: str = Field(min_length=1, max_length=5000)
    top_k: int = Field(default=5, ge=1, le=20)

    model_config = ConfigDict(str_strip_whitespace=True)


class SourceReference(BaseModel):
    document_id: int
    chunk_id: int
    page_number: int
    text: str


class QuestionResponse(BaseModel):
    question: str
    answer: str
    sources: list[SourceReference]
