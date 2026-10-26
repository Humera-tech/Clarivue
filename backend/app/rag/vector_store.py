
import logging
from functools import lru_cache
from pathlib import Path
from typing import Any

import chromadb

from app.core.config import settings
from app.rag.embeddings import embed_query, embed_texts

logger = logging.getLogger(__name__)

CHROMA_PATH = settings.CHROMA_PERSIST_DIR
COLLECTION_NAME = "clarivue_chunks"


@lru_cache(maxsize=1)
def get_collection():
    persist_path = Path(CHROMA_PATH).resolve()
    persist_path.mkdir(parents=True, exist_ok=True)

    logger.info("Using ChromaDB persistence path: %s", persist_path)

    client = chromadb.PersistentClient(path=str(persist_path))

    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def index_chunks(
    document_id: int,
    chunks: list[dict[str, Any]],
) -> int:
    if not chunks:
        return 0

    valid_chunks = [
        chunk for chunk in chunks
        if str(chunk.get("text", "")).strip()
    ]

    if not valid_chunks:
        return 0

    collection = get_collection()

    texts = [str(chunk["text"]) for chunk in valid_chunks]
    embeddings = embed_texts(texts)

    ids = [
        f"document_{document_id}_chunk_{chunk['id']}"
        for chunk in valid_chunks
    ]

    metadatas = [
        {
            "document_id": document_id,
            "chunk_id": int(chunk["id"]),
            "page_number": int(chunk.get("page_number") or 1),
        }
        for chunk in valid_chunks
    ]

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    return len(valid_chunks)


def search_chunks(
    query: str,
    document_id: int,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    if not query.strip():
        raise ValueError("Query cannot be empty.")

    if top_k < 1 or top_k > 20:
        raise ValueError("top_k must be between 1 and 20.")

    collection = get_collection()

    if collection.count() == 0:
        return []

    results = collection.query(
        query_embeddings=[embed_query(query)],
        n_results=min(top_k, collection.count()),
        where={"document_id": document_id},
        include=["documents", "metadatas", "distances"],
    )

    matches = []

    for i, text in enumerate(results["documents"][0]):
        metadata = results["metadatas"][0][i]
        distance = results["distances"][0][i]

        matches.append(
            {
                "document_id": metadata["document_id"],
                "chunk_id": metadata["chunk_id"],
                "page_number": metadata["page_number"],
                "text": text,
                "distance": distance,
            }
        )

    return matches


def delete_document_index(document_id: int) -> None:
    collection = get_collection()

    collection.delete(
        where={"document_id": document_id}
    )


def get_document_index_stats(document_id: int) -> dict:
    """Return indexing statistics for a document in ChromaDB."""
    collection = get_collection()

    results = collection.get(
        where={"document_id": document_id},
        include=["metadatas"],
    )

    metadatas = results.get("metadatas") or []

    page_numbers = sorted({
        int(item.get("page_number", 1))
        for item in metadatas
    })

    return {
        "document_id": document_id,
        "indexed_chunk_count": len(metadatas),
        "indexed_pages": page_numbers,
    }


def get_all_index_stats() -> dict:
    """Return basic statistics for all chunks in the ChromaDB collection."""
    collection = get_collection()

    results = collection.get(include=["metadatas"])
    metadatas = results.get("metadatas") or []

    documents = {}

    for metadata in metadatas:
        document_id = int(metadata["document_id"])
        documents.setdefault(document_id, []).append(
            int(metadata.get("page_number", 1))
        )

    return {
        "total_indexed_chunks": len(metadatas),
        "documents": {
            document_id: {
                "indexed_chunk_count": len(pages),
                "indexed_pages": sorted(set(pages)),
            }
            for document_id, pages in documents.items()
        },
    }
