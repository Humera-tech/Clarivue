from pathlib import Path

# Run this script from inside the backend directory:
#   cd clarivue/backend
#   python create_backend_structure.py
BASE = Path(".")

folders = [
    # Application package
    "app",
    "app/core",
    "app/api",
    "app/api/v1",
    "app/api/v1/endpoints",
    "app/schemas",
    "app/models",
    "app/repositories",
    "app/services",
    "app/ingestion",
    "app/rag",
    "app/analysis",
    "app/db",
    "app/utils",

    # Database migrations
    "alembic",
    "alembic/versions",

    # Tests
    "tests",
    "tests/api",
    "tests/ingestion",
    "tests/rag",
    "tests/analysis",
    "tests/fixtures",

    # Local-development storage (contents are git-ignored)
    "uploads",
    "chroma_data",

    # Helper scripts
    "scripts",
]

# Packages that need an __init__.py so Python can import them
package_dirs = [
    "app",
    "app/core",
    "app/api",
    "app/api/v1",
    "app/api/v1/endpoints",
    "app/schemas",
    "app/models",
    "app/repositories",
    "app/services",
    "app/ingestion",
    "app/rag",
    "app/analysis",
    "app/db",
    "app/utils",
    "tests",
]

files = [
    # Entry point
    "app/main.py",

    # Core: configuration, security, logging, errors
    "app/core/config.py",
    "app/core/security.py",
    "app/core/logging.py",
    "app/core/exceptions.py",

    # API layer
    "app/api/deps.py",
    "app/api/v1/router.py",
    "app/api/v1/endpoints/auth.py",
    "app/api/v1/endpoints/collections.py",
    "app/api/v1/endpoints/documents.py",
    "app/api/v1/endpoints/questions.py",
    "app/api/v1/endpoints/conversations.py",
    "app/api/v1/endpoints/analysis.py",
    "app/api/v1/endpoints/evaluations.py",
    "app/api/v1/endpoints/health.py",

    # Schemas (Pydantic request/response models)
    "app/schemas/auth.py",
    "app/schemas/user.py",
    "app/schemas/collection.py",
    "app/schemas/document.py",
    "app/schemas/question.py",
    "app/schemas/conversation.py",
    "app/schemas/citation.py",
    "app/schemas/analysis.py",
    "app/schemas/evaluation.py",

    # Models (SQLAlchemy tables)
    "app/models/user.py",
    "app/models/collection.py",
    "app/models/document.py",
    "app/models/conversation.py",
    "app/models/message.py",
    "app/models/citation.py",

    # Repositories (database queries)
    "app/repositories/user_repository.py",
    "app/repositories/collection_repository.py",
    "app/repositories/document_repository.py",
    "app/repositories/conversation_repository.py",
    "app/repositories/citation_repository.py",

    # Services (application logic)
    "app/services/auth_service.py",
    "app/services/collection_service.py",
    "app/services/document_service.py",
    "app/services/conversation_service.py",
    "app/services/analysis_service.py",
    "app/services/evaluation_service.py",
    "app/services/storage_service.py",

    # Ingestion pipeline: PDF -> text -> chunks -> embeddings
    "app/ingestion/pdf_extractor.py",
    "app/ingestion/chunker.py",
    "app/ingestion/indexer.py",
    "app/ingestion/pipeline.py",

    # RAG pipeline: question -> retrieval -> LLM -> citations
    "app/rag/embeddings.py",
    "app/rag/vector_store.py",
    "app/rag/retriever.py",
    "app/rag/prompts.py",
    "app/rag/llm_client.py",
    "app/rag/generator.py",
    "app/rag/citations.py",
    "app/rag/pipeline.py",

    # Claim comparison and conflict detection
    "app/analysis/claim_extractor.py",
    "app/analysis/conflict_detector.py",
    "app/analysis/evidence_checks.py",

    # Database setup
    "app/db/base.py",
    "app/db/session.py",

    # Utilities
    "app/utils/file_validation.py",
    "app/utils/text_cleaning.py",

    # Alembic
    "alembic.ini",
    "alembic/env.py",
    "alembic/script.py.mako",

    # Tests
    "tests/conftest.py",
    "tests/api/test_health.py",
    "tests/api/test_auth.py",
    "tests/api/test_documents.py",
    "tests/api/test_questions.py",
    "tests/ingestion/test_pdf_extractor.py",
    "tests/ingestion/test_chunker.py",
    "tests/rag/test_retriever.py",
    "tests/rag/test_citations.py",
    "tests/analysis/test_conflict_detector.py",

    # Scripts
    "scripts/seed_dev_data.py",

    # Project files
    "requirements.txt",
    "requirements-dev.txt",
    "pytest.ini",
    ".env.example",
    ".gitignore",
    "README.md",
]

# Keep empty local-storage folders in Git without committing their contents
placeholder_files = [
    "uploads/.gitkeep",
    "chroma_data/.gitkeep",
    "tests/fixtures/.gitkeep",
    "alembic/versions/.gitkeep",
]

# Files that start with useful content instead of being empty
seed_content = {
    "requirements.txt": """# Web framework
fastapi
uvicorn[standard]
python-multipart

# Validation and settings
pydantic
pydantic-settings
email-validator

# Database
sqlalchemy
alembic
psycopg2-binary

# Authentication
pwdlib[argon2]
pyjwt

# Documents and AI
pymupdf
chromadb
sentence-transformers
# Add your hosted LLM provider's SDK here, for example: anthropic
httpx
""",
    "requirements-dev.txt": """-r requirements.txt
pytest
pytest-asyncio
httpx
""",
    "pytest.ini": """[pytest]
testpaths = tests
pythonpath = .
""",
    ".env.example": """# Application
APP_NAME=Clarivue
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/clarivue

# Authentication
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=20
CHROMA_PERSIST_DIR=./chroma_data

# Embeddings
EMBEDDING_MODEL=your-sentence-transformer-model

# LLM provider (keep keys out of Git)
LLM_PROVIDER=your-provider
LLM_API_KEY=your-api-key
LLM_MODEL=your-model-name

# Retrieval settings (tune with experiments)
CHUNK_SIZE=800
CHUNK_OVERLAP=120
RETRIEVAL_TOP_K=5
""",
    ".gitignore": """# Python
__pycache__/
*.pyc
venv/
.venv/
.pytest_cache/

# Secrets
.env

# Local storage
uploads/*
!uploads/.gitkeep
chroma_data/*
!chroma_data/.gitkeep

# Editors and OS
.vscode/
.idea/
.DS_Store
""",
    "README.md": """# Clarivue Backend

FastAPI backend for Clarivue: authentication, document ingestion, RAG question
answering with citations, and conflict detection.

## Run locally

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\\Scripts\\activate
pip install -r requirements-dev.txt
cp .env.example .env            # then fill in your values
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs
""",
}

created_folders = 0
created_files = 0
skipped_files = 0

print("\nCreating Clarivue backend structure...\n")

# Create folders
for folder in folders:
    path = BASE / folder

    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)
        print(f"[FOLDER] {folder}")
        created_folders += 1
    else:
        print(f"[EXISTS] {folder}")

# Gather every file to create (without overwriting existing ones)
all_files = list(files) + placeholder_files
all_files += [f"{pkg}/__init__.py" for pkg in package_dirs]

for file in all_files:
    path = BASE / file

    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        if file in seed_content:
            path.write_text(seed_content[file], encoding="utf-8")
        else:
            path.touch()
        print(f"[FILE]   {file}")
        created_files += 1
    else:
        print(f"[SKIP]   {file} (already exists)")
        skipped_files += 1

print("\n" + "=" * 45)
print("Clarivue backend structure is ready!")
print(f"Folders created: {created_folders}")
print(f"Files created:   {created_files}")
print(f"Files skipped:   {skipped_files}")
print("=" * 45)
print("\nExisting files were preserved.")
print("Next: implement the backend step by step, starting with")
print("app/main.py, app/core/config.py and the health endpoint.")