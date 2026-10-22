# Clarivue Backend

FastAPI backend for Clarivue: authentication, document ingestion, RAG question
answering with citations, and conflict detection.

## Run locally

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
cp .env.example .env            # then fill in your values
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs
