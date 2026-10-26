from app.rag.vector_store import (
    get_document_index_stats,
    get_all_index_stats,
)

print("Document 6 indexing statistics:")
print(get_document_index_stats(6))

print("\nAll indexed documents:")
print(get_all_index_stats())