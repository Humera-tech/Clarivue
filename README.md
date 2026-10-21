<div align="center">

# Clarivue

**Document intelligence. Research beyond the surface.**

*Every answer needs evidence.*

Ask questions across documents. Follow the evidence. Discover what doesn't agree.

![Status](https://img.shields.io/badge/status-in%20development-0B5C73)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-2563EB)
![Backend](https://img.shields.io/badge/backend-FastAPI-059669)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![Vector Store](https://img.shields.io/badge/vector%20store-Chroma-F59E0B)

<!-- Replace with a real screenshot once the UI is built -->
<!-- ![Clarivue hero screenshot](docs/images/hero.png) -->

</div>

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Features and Scope](#4-features-and-scope)
5. [Tech Stack](#5-tech-stack)
6. [System Architecture](#6-system-architecture)
7. [Workflows](#7-workflows)
8. [RAG Pipeline](#8-rag-pipeline)
9. [Claim and Contradiction Detection](#9-claim-and-contradiction-detection)
10. [Database Design](#10-database-design)
11. [API Reference](#11-api-reference)
12. [Project Structure](#12-project-structure)
13. [Getting Started](#13-getting-started)
14. [Evaluation Methodology](#14-evaluation-methodology)
15. [Security and Reliability](#15-security-and-reliability)
16. [Development Roadmap](#16-development-roadmap)
17. [Deployment](#17-deployment)
18. [Limitations and Ethical Considerations](#18-limitations-and-ethical-considerations)
19. [Future Improvements](#19-future-improvements)
20. [Contributing](#20-contributing)
21. [License](#21-license)

---

## 1. Overview

**Clarivue** is an AI-powered document intelligence platform built on **Retrieval-Augmented Generation (RAG)**. Users upload PDFs into a collection, ask questions across them, and receive answers with **traceable source citations** (document and page). Clarivue can also surface **potentially conflicting claims** between documents, showing the original passages side by side so users can judge for themselves.

Clarivue is designed to be an evidence-focused research tool rather than a generic chatbot: answers are grounded in retrieved passages, citations come from real retrieval metadata, and quality is measured with a proper evaluation suite.

> **Status:** Clarivue is under active development. This README describes the target design. Sections on evaluation results will be filled in with real, measured numbers after experiments are run.

---

## 2. Problem Statement

People often need to understand information spread across multiple research papers, reports, policies, technical documents, or other PDFs. Manually finding relevant passages, comparing claims, and tracing conclusions back to their sources takes time.

General-purpose AI assistants can help summarize information, but their answers may omit context, overlook conflicting evidence, or include claims that the supplied documents don't support. Users need a way to ask questions about a document collection **and independently inspect the evidence** behind the answers.

**Formal problem statement**

> Developing an AI-powered document intelligence platform that uses Retrieval-Augmented Generation (RAG) to answer questions from user-provided documents, provide traceable source citations, and identify potentially conflicting claims across documents. The system will prioritize evidence-grounded answers, transparency, and measurable retrieval and response quality.

### Target users

- Students reviewing multiple research papers
- Researchers comparing findings across studies
- Professionals analyzing reports, policies, or technical documentation
- Teams that need to locate and compare information across a document collection

The first version focuses on **students and researchers working with text-based PDFs**.

---

## 3. Proposed Solution

```mermaid
flowchart LR
    A["01 Upload<br/>PDFs into a collection"] --> B["02 Index<br/>Extract, chunk, embed"]
    B --> C["03 Retrieve<br/>Find relevant passages"]
    C --> D["04 Answer<br/>LLM grounded in evidence"]
    D --> E["05 Compare<br/>Flag potential conflicts"]
```

| Step | What happens |
| --- | --- |
| **Upload** | Upload PDFs and create a document collection. |
| **Index** | Extract text, split it into chunks, create embeddings, and index them for retrieval. |
| **Retrieve** | Find passages relevant to the user's question. |
| **Answer** | Give the retrieved passages to an LLM to generate an answer grounded in the available evidence. |
| **Compare** | Compare claims and flag potential contradictions, with the relevant passages from each source. |

### Example

A user uploads two research papers and asks:

> *"Does remote learning improve academic performance?"*

- **Paper A** reports higher average test scores.
- **Paper B** reports no statistically significant improvement.
- Clarivue summarizes each finding, cites the corresponding passages, and **flags the apparent disagreement**.

Clarivue does **not** automatically declare either paper correct. It explains that the results differ and helps the user inspect study methods, populations, and limitations.

---

## 4. Features and Scope

### Phase 1: Core MVP

- [ ] User signup and login
- [ ] PDF upload and document library
- [ ] PDF text extraction and chunking
- [ ] Embedding generation and semantic search
- [ ] RAG question answering
- [ ] Answers with document and page citations
- [ ] Conversation history
- [ ] Compare claims across multiple documents
- [ ] Evaluation dashboard

### Phase 2: Advanced capabilities

- [ ] **Hybrid retrieval:** combine semantic search with keyword search
- [ ] **Reranking:** improve the ordering of retrieved passages
- [ ] **Claim comparison:** extract claims and classify relationships (support, contradiction, insufficient evidence)
- [ ] **Evidence quality checks:** detect answers that lack supporting passages
- [ ] **Better PDF support:** tables, scanned pages (OCR), and complex layouts where feasible

> Advanced features are only added once the basic RAG system works reliably.

---

## 5. Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS, Lucide icons | UI for upload, chat, and evidence inspection |
| Backend | Python, FastAPI, Uvicorn | REST APIs, auth, document processing, RAG orchestration |
| Database | PostgreSQL, SQLAlchemy, Alembic | Users, documents, status, conversations, citations, migrations |
| Vector search | Chroma | Store and search chunk embeddings |
| Embeddings | Sentence Transformers | Convert chunks and questions into vectors |
| LLM | Hosted model API (provider is configurable) | Generate evidence-grounded answers |
| PDF extraction | PyMuPDF | Extract text and page information |
| Validation | Pydantic, `pydantic-settings` | Request/response schemas and configuration |
| Auth | `pwdlib` (or another maintained hashing library) + JWT | Password hashing and token authentication |
| Testing | Pytest, HTTPX | API and pipeline tests |
| Deployment | Vercel (frontend), Render (backend) | Hosting |

> **Design note:** The first retrieval and generation steps are written directly in Python rather than with a large orchestration framework, so each component is understood. LangChain or LlamaIndex can be introduced later if they solve a specific problem. `pgvector` can replace Chroma later if consolidating into PostgreSQL becomes useful.

---

## 6. System Architecture

```mermaid
flowchart TB
    subgraph Client["Client"]
        FE["React + TypeScript Frontend<br/>Upload, Ask, Inspect citations"]
    end

    subgraph Server["Backend"]
        API["FastAPI<br/>Auth, REST APIs, business logic"]
        ING["Ingestion Pipeline<br/>PDF to text to chunks to embeddings"]
        RAG["RAG Pipeline<br/>Question to retrieval to LLM to citations"]
        ANA["Analysis Module<br/>Claim extraction and conflict detection"]
    end

    subgraph Storage["Storage"]
        PG[("PostgreSQL<br/>Users, metadata, history")]
        CH[("Chroma<br/>Embeddings and search")]
        FS[("File Storage<br/>Uploaded PDFs")]
    end

    subgraph External["External Services"]
        EMB["Sentence Transformer<br/>Embedding model"]
        LLM["Hosted LLM API"]
    end

    FE <-->|"HTTPS / REST"| API
    API --> ING
    API --> RAG
    API --> ANA
    API <--> PG
    ING --> FS
    ING --> EMB
    ING --> CH
    RAG --> EMB
    RAG --> CH
    RAG --> LLM
    ANA --> LLM
    ANA --> CH
```

**Key principle:** the PostgreSQL database stores structured application data, while Chroma stores vectors for semantic search. They serve different purposes.

---

## 7. Workflows

### 7.1 Document upload and ingestion

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant API as FastAPI
    participant PDF as PyMuPDF
    participant EMB as Embedding Model
    participant CH as Chroma
    participant PG as PostgreSQL

    U->>FE: Select PDF
    FE->>API: POST /documents/upload
    API->>API: Validate file type and size
    API->>PG: Create document record (status: processing)
    API->>PDF: Extract text and page info
    PDF-->>API: Pages of text
    API->>API: Split into overlapping chunks
    API->>EMB: Embed each chunk
    EMB-->>API: Vectors
    API->>CH: Store vectors + chunk IDs + source metadata
    API->>PG: Update status (ready) and page_count
    API-->>FE: Document metadata
    FE-->>U: Document appears in library
```

1. The frontend sends the file to FastAPI.
2. The backend validates the file type and size.
3. PyMuPDF extracts text and page information.
4. The text is split into smaller chunks.
5. A pretrained embedding model converts each chunk into a vector.
6. Chroma stores the vectors alongside chunk IDs and source metadata.
7. PostgreSQL stores the document record, owner, status, and processing details.

### 7.2 Asking a question (RAG)

```mermaid
sequenceDiagram
    actor U as User
    participant FE as Frontend
    participant API as FastAPI
    participant PG as PostgreSQL
    participant EMB as Embedding Model
    participant CH as Chroma
    participant LLM as LLM

    U->>FE: Ask a question
    FE->>API: POST /questions
    API->>PG: Verify user owns the collection
    API->>EMB: Embed the question
    EMB-->>API: Question vector
    API->>CH: Retrieve top-k chunks (scoped to user's collection)
    CH-->>API: Chunks + metadata
    API->>LLM: Question + retrieved evidence + instructions
    LLM-->>API: Generated answer
    API->>API: Attach citations from real chunk metadata
    API->>PG: Save message and citations
    API-->>FE: Answer + citations + insufficient_evidence flag
    FE-->>U: Answer with inspectable source passages
```

1. FastAPI receives the question and checks which documents the user is allowed to access.
2. The embedding model converts the question into a vector.
3. Chroma retrieves relevant chunks from that user's document collection.
4. The backend passes the question and retrieved evidence to the LLM.
5. The LLM generates an answer constrained by instructions to use the supplied evidence.
6. The backend returns the answer and citation metadata.
7. The frontend displays the answer and lets the user inspect the source passages.

> **Critical detail:** the LLM must **never** invent page numbers or source references. Citations are attached by the backend from the actual retrieved chunk metadata.

### 7.3 End-to-end user journey

```mermaid
flowchart LR
    A([Sign up / Log in]) --> B[Create collection]
    B --> C[Upload PDFs]
    C --> D{Processing<br/>complete?}
    D -- No --> D
    D -- Yes --> E[Ask a question]
    E --> F[Read answer + citations]
    F --> G[Inspect source passages]
    G --> H{Compare<br/>documents?}
    H -- Yes --> I[Run conflict analysis]
    I --> J[Review side-by-side evidence]
    H -- No --> E
    J --> E
```

---

## 8. RAG Pipeline

### Document ingestion

```mermaid
flowchart LR
    A[PDF] --> B["Extract text<br/>and page metadata"]
    B --> C["Split into<br/>overlapping chunks"]
    C --> D["Generate<br/>embeddings"]
    D --> E["Index chunks<br/>in Chroma"]
```

### Question answering

```mermaid
flowchart LR
    A[User question] --> B[Embed the question]
    B --> C[Retrieve most<br/>relevant chunks]
    C --> D["Construct evidence-<br/>based prompt"]
    D --> E[LLM generates answer]
    E --> F["Return answer +<br/>source citations"]
```

### Core concepts

| Concept | Explanation |
| --- | --- |
| **Chunking** | Splitting long documents into smaller passages so retrieval can find the relevant section instead of sending an entire PDF to the LLM. |
| **Embeddings** | Numerical vectors representing patterns of meaning in text. Similar passages often have nearby vectors, though similarity is not the same as factual correctness. |
| **Vector similarity** | Comparing a question's vector with chunk vectors (cosine similarity or the vector store's supported similarity search) to find relevant passages. |
| **Context window** | The amount of input and output a model can process in one request. Retrieval supplies only relevant passages rather than every document. |

Chunk size, overlap, and retrieval count (`k`) will be tuned through experiments. There is no universally optimal configuration.

### Generation prompt rules

The prompt instructs the LLM to:

- Answer using only the supplied evidence.
- Distinguish evidence from interpretation.
- Cite only the supplied source references.
- State when the evidence is insufficient.
- Avoid claiming that a document proves more than it actually says.

A prompt helps but is not a guarantee, so behavior is verified through evaluation.

---

## 9. Claim and Contradiction Detection

This is the feature that goes beyond a basic RAG application. It is built **after** question answering and citations work reliably.

```mermaid
flowchart TB
    A["Retrieve relevant passages<br/>from multiple documents"] --> B["Extract individual claims<br/>from passages"]
    B --> C["Group claims that discuss<br/>the same topic"]
    C --> D["Pairwise comparison<br/>using an LLM"]
    D --> E{Relationship}
    E --> F[Supporting]
    E --> G[Contradicting]
    E --> H[Complementary]
    E --> I[Inconclusive]
    F --> J["Display original passages<br/>side by side"]
    G --> J
    H --> J
    I --> J
```

| Classification | Meaning |
| --- | --- |
| **Supporting** | One passage supports another claim. |
| **Contradicting** | The passages appear to disagree. |
| **Complementary** | The passages add different information. |
| **Inconclusive** | There isn't enough evidence to determine the relationship. |

For example, *"The treatment improved scores by 12%"* and *"The treatment had no statistically significant effect"* may appear contradictory, but study populations, experimental conditions, and statistical methods must be considered before drawing a conclusion. Clarivue flags **potential** conflicts and leaves the judgment to the user.

**Implementation approach:** start with LLM-based claim extraction and pairwise comparison, then evaluate classifications against manually labeled examples. No custom contradiction model is trained at the beginning.

---

## 10. Database Design

PostgreSQL stores structured application data. For the first version, chunk text and metadata live in Chroma, while document-level metadata lives in PostgreSQL.

```mermaid
erDiagram
    USERS ||--o{ COLLECTIONS : owns
    USERS ||--o{ DOCUMENTS : uploads
    USERS ||--o{ CONVERSATIONS : starts
    COLLECTIONS ||--o{ DOCUMENTS : contains
    COLLECTIONS ||--o{ CONVERSATIONS : "analyzed in"
    CONVERSATIONS ||--o{ MESSAGES : has
    MESSAGES ||--o{ CITATIONS : references
    DOCUMENTS ||--o{ CITATIONS : "cited by"

    USERS {
        uuid id PK
        string email
        string password_hash
        datetime created_at
    }
    COLLECTIONS {
        uuid id PK
        uuid user_id FK
        string name
        datetime created_at
    }
    DOCUMENTS {
        uuid id PK
        uuid user_id FK
        uuid collection_id FK
        string filename
        string storage_key
        string status
        int page_count
        datetime created_at
    }
    CONVERSATIONS {
        uuid id PK
        uuid user_id FK
        uuid collection_id FK
        string title
        datetime created_at
    }
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        string role
        text content
        datetime created_at
    }
    CITATIONS {
        uuid id PK
        uuid message_id FK
        uuid document_id FK
        int page_number
        string chunk_id
        text excerpt
    }
```

| Table | Purpose |
| --- | --- |
| `users` | User accounts. Passwords are always hashed, never stored in plaintext. |
| `collections` | Groups related documents (e.g., one collection per research topic). |
| `documents` | Tracks uploaded files and whether text and embeddings are ready. |
| `conversations` | A user's analysis sessions. |
| `messages` | Questions and answers. |
| `citations` | Links answers to actual source passages. |

Later, `claims` and `conflicts` tables can store extracted claims, their source references, and classification results.

---

## 11. API Reference

All endpoints are versioned under `/api/v1`. Interactive docs will be available at `/docs` (Swagger UI) when the backend is running.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create an account |
| `POST` | `/auth/login` | Authenticate a user |
| `GET` | `/auth/me` | Get current user details |
| `POST` | `/collections` | Create a collection |
| `GET` | `/collections` | List the user's collections |
| `POST` | `/documents/upload` | Upload a PDF |
| `GET` | `/documents` | List accessible documents |
| `GET` | `/documents/{id}` | Get document status and metadata |
| `DELETE` | `/documents/{id}` | Delete a document and its indexed chunks |
| `POST` | `/questions` | Ask a question using RAG |
| `GET` | `/conversations` | List previous analysis sessions |
| `GET` | `/conversations/{id}` | Retrieve conversation history |
| `POST` | `/collections/{id}/compare` | Analyze potential conflicts across documents |
| `GET` | `/health` | Check service health |

> These routes are proposed; request and response schemas will be finalized during implementation.

### Example: asking a question

**Request**

```json
{
  "collection_id": "collection-123",
  "question": "What are the main findings?",
  "conversation_id": null
}
```

**Response**

```json
{
  "answer": "The studies report different findings...",
  "citations": [
    {
      "document_id": "doc-456",
      "filename": "research-paper.pdf",
      "page_number": 12,
      "excerpt": "The results indicate..."
    }
  ],
  "insufficient_evidence": false
}
```

*IDs and content above are illustrative. In the real system the backend validates access to the collection, retrieves actual chunks, and builds citations from retrieved metadata.*

---

## 12. Project Structure


```

> This is the **target** structure. Files are created incrementally as each feature is implemented. `chroma_data/` and `uploads/` are local-development directories; production storage is configured separately and must not be committed to Git.

### Backend layers

```mermaid
flowchart TB
    A["api/<br/>HTTP requests and responses"] --> B["schemas/<br/>Pydantic validation"]
    A --> C["services/<br/>Application logic"]
    C --> D["repositories/<br/>Database queries"]
    D --> E["models/<br/>SQLAlchemy tables"]
    C --> F["ingestion/<br/>Extract and index content"]
    C --> G["rag/<br/>Embeddings, retrieval, prompts,<br/>generation, citations"]
    C --> H["analysis/<br/>Claim comparison"]
```

| Layer | Responsibility |
| --- | --- |
| `api/` | Receives HTTP requests and returns responses |
| `schemas/` | Validates request and response data with Pydantic |
| `models/` | Represents relational database tables |
| `repositories/` | Handles database queries |
| `services/` | Coordinates application logic |
| `ingestion/` | Extracts and indexes document content |
| `rag/` | Embeddings, retrieval, prompts, generation, citations |
| `analysis/` | Claim comparison and potential conflict detection |
| `evaluation/` | Measures retrieval and answer quality |

For example, `questions.py` receives a question, `analysis_service.py` coordinates the request, and `rag/pipeline.py` performs retrieval and generation. Keeping these separate makes debugging much easier.

---

## 13. Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+
- An API key for your chosen hosted LLM provider

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/clarivue.git
cd clarivue
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env            # then fill in your values
alembic upgrade head            # run database migrations
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` and interactive docs at `http://localhost:8000/docs`.

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env            # then fill in your values
npm run dev
```

The app runs at `http://localhost:5173`.

### 4. Environment variables

**`backend/.env.example`**

```env
DATABASE_URL=postgresql://user:password@localhost:5432/clarivue
SECRET_KEY=change-me
ACCESS_TOKEN_EXPIRE_MINUTES=60

LLM_PROVIDER=your-provider
LLM_API_KEY=your-api-key
LLM_MODEL=your-model-name

EMBEDDING_MODEL=your-sentence-transformer-model
CHROMA_PERSIST_DIR=./chroma_data
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=20
CORS_ORIGINS=http://localhost:5173
```

**`frontend/.env.example`**

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

> Never commit real `.env` files or API keys. Never expose the LLM provider key in frontend code.

### 5. Run tests

```bash
cd backend
pytest
```

---

## 14. Evaluation Methodology

A polished UI is not proof that the AI works. Clarivue includes an evaluation suite built on a small test dataset of documents, questions, relevant source passages, expected answers, and known conflicting claims.

| Metric | What it measures |
| --- | --- |
| **Recall@k** | How often the retrieved top-k passages include the relevant evidence |
| **MRR** | How highly the first relevant passage ranks |
| **Citation correctness** | Whether citations point to real, relevant source passages |
| **Answer groundedness** | Whether answer claims are supported by the retrieved evidence |
| **Answer correctness** | Whether the answer matches the expected conclusion |
| **Abstention quality** | Whether the system appropriately declines to answer when evidence is insufficient |
| **Conflict classification quality** | Precision, recall, and F1 for labeled claim relationships |

```mermaid
flowchart LR
    A["Test dataset<br/>documents + questions + labels"] --> B["Run pipeline<br/>baseline config"]
    A --> C["Run pipeline<br/>improved config"]
    B --> D[Compute metrics]
    C --> D
    D --> E["Compare results<br/>in evaluation/results"]
    E --> F[Tune chunking, k,<br/>retrieval strategy, prompts]
    F --> C
```

Baseline configurations (e.g., vector-only retrieval) are compared against improvements (e.g., hybrid retrieval, reranking).

### Results

> *Results will be added here after experiments are run. No accuracy numbers will be published that were not actually measured.*

| Configuration | Recall@k | MRR | Citation correctness | Groundedness |
| --- | --- | --- | --- | --- |
| Baseline (vector only) | TBD | TBD | TBD | TBD |
| Hybrid retrieval | TBD | TBD | TBD | TBD |
| Hybrid + reranking | TBD | TBD | TBD | TBD |

---

## 15. Security and Reliability

- Hash passwords using a maintained password-hashing library.
- Authenticate protected endpoints and verify document ownership on every relevant request.
- Validate uploaded file types and sizes; don't trust the filename alone.
- Keep API keys and database credentials in environment variables.
- Never expose the LLM provider's secret API key in frontend code.
- Treat uploaded documents as **untrusted input** to prevent prompt injection from overriding system instructions.
- Handle empty, corrupt, scanned, and unusually large PDFs gracefully.
- Delete indexed chunks and stored files when a document is deleted.
- Scope retrieval by user and collection so one user's documents can never be retrieved by another user's queries.
- Make clear that citations establish **where information came from**, not that the source itself is true.

The first version supports **text-based PDFs**. Scanned PDFs will be supported later through OCR.

---

## 16. Development Roadmap

```mermaid
flowchart LR
    P1["Phase 1<br/>Foundation and UI"] --> P2["Phase 2<br/>Backend and documents"]
    P2 --> P3["Phase 3<br/>Embeddings and retrieval"]
    P3 --> P4["Phase 4<br/>RAG and citations"]
    P4 --> P5["Phase 5<br/>Claim comparison"]
    P5 --> P6["Phase 6<br/>Evaluation and deployment"]
```

| Phase | Focus | Deliverable | Acceptance check |
| --- | --- | --- | --- |
| **1. Foundation and UI** | Repo setup, React + FastAPI config, design system, landing page, auth screens | Polished frontend shell | Pages render and routes work |
| **2. Backend and documents** | PostgreSQL, authentication, PDF upload, text extraction, chunking, status tracking | Working document library | Uploaded PDF is stored and shows status |
| **3. Embeddings and retrieval** | Generate embeddings, index in Chroma, test semantic search | Relevant passage retrieval | Known questions return the correct page |
| **4. RAG and citations** | LLM integration, evidence-grounded prompts, source references, insufficient-evidence handling | Working Clarivue Q&A | Answers cite real passages; unsupported questions abstain |
| **5. Claim comparison** | Claim extraction, passage comparison, side-by-side UI | Potential conflict analysis | Labeled conflict examples are surfaced |
| **6. Evaluation and deployment** | Test questions, metrics, fixes, deployment | Evaluated, deployed project | Metrics recorded; live demo works |

We don't move to the next phase just because the code runs. Each phase has a small acceptance test.

---

## 17. Deployment

```mermaid
flowchart LR
    U([User]) --> V["Vercel<br/>React frontend"]
    V -->|HTTPS| R["Render<br/>FastAPI backend"]
    R --> P[("Managed PostgreSQL")]
    R --> S[("Persistent object storage<br/>Uploaded PDFs")]
    R --> C[("Chroma with persistent storage<br/>or managed alternative")]
    R --> L["Hosted LLM API"]
```

| Component | Suggested platform |
| --- | --- |
| React frontend | Vercel |
| FastAPI backend | Render |
| PostgreSQL | Managed PostgreSQL provider |
| Uploaded PDF files | Persistent object storage |
| Vector index | Chroma with persistent storage, or a managed alternative |
| LLM | Hosted model provider |
| Embedding model | Pretrained sentence-transformer |

> **Important:** an ephemeral application filesystem can lose uploaded files and local Chroma data on redeploy. Use persistent or managed storage instead of assuming local files will survive.

For a portfolio MVP, keep costs controlled with upload limits, reasonable retrieval counts, and a small test dataset.

**Live demo:** _coming soon_

---

## 18. Limitations and Ethical Considerations

- **Citations are not truth.** A citation shows where a claim came from, not that the source is correct.
- **LLMs can still make mistakes.** Even with grounded prompts, answers may misinterpret or over-extend the evidence. Users should inspect the cited passages.
- **Conflict flags are suggestions.** Apparent contradictions may stem from different populations, methods, or definitions. Clarivue does not decide which source is right.
- **PDF extraction is imperfect.** Tables, multi-column layouts, and scanned pages may extract poorly in the first version.
- **Retrieval can miss evidence.** Embedding similarity is not the same as relevance or correctness.
- **Privacy.** Uploaded documents may contain sensitive content. Users should be aware that passages are sent to a hosted LLM provider, and should review that provider's data handling policy.
- **Not professional advice.** Clarivue is a research aid, not a substitute for expert review in legal, medical, or other high-stakes settings.

---

## 19. Future Improvements

- Hybrid retrieval (semantic + keyword) and reranking
- OCR for scanned PDFs and better table handling
- Evidence quality checks and stronger abstention behavior
- Support for additional document types beyond PDF
- Streaming answers
- Shared collections and team workspaces
- `pgvector` as a consolidated vector store option
- Evaluation dashboard with experiment history

---

## 20. Contributing

Contributions, issues, and feature suggestions are welcome once the core MVP is in place.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a pull request

---

## 21. License

Distributed under the license in [`LICENSE`](./LICENSE).

---

<div align="center">

**Clarivue** · Every answer needs evidence.

</div>