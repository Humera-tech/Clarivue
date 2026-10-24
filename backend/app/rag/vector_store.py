
import os
from functools import lru_cache
from pathlib import Path
from typing import Any

import chromadb

from app.rag.embeddings import embed_query, embed_texts


CHROMA_PATH = os.getenv("CHROMA_PATH", "./data/chroma")
COLLECTION_NAME = "clarivue_chunks"


@lru_cache(maxsize=1)
def get_collection():
    Path(CHROMA_PATH).mkdir(parents=True, exist_ok=True)

    client = chromadb.PersistentClient(path=CHROMA_PATH)

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
