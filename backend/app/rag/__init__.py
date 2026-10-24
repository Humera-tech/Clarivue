
from app.rag.vector_store import index_chunks, search_chunks


def main():
    document_id = 999999

    sample_chunks = [
        {
            "id": 1,
            "text": "Machine learning models learn patterns from data.",
            "page_number": 1,
        },
        {
            "id": 2,
            "text": "PostgreSQL is a relational database system.",
            "page_number": 2,
        },
        {
            "id": 3,
            "text": "Neural networks are used in deep learning.",
            "page_number": 3,
        },
    ]

    count = index_chunks(document_id, sample_chunks)
    print(f"Indexed chunks: {count}")

    results = search_chunks(
        query="How do computers learn from examples?",
        document_id=document_id,
        top_k=2,
    )

    for result in results:
        print(f"\nPage: {result['page_number']}")
        print(f"Text: {result['text']}")
        print(f"Distance: {result['distance']:.4f}")


if __name__ == "__main__":
    main()
