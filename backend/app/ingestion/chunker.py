def chunk_pages(
    pages: list[dict],
    chunk_size: int = 1000,
    overlap: int = 150,
) -> list[dict]:
    """Split extracted page text into overlapping chunks."""

    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than zero.")

    if overlap < 0 or overlap >= chunk_size:
        raise ValueError(
            "Overlap must be non-negative and smaller than chunk_size."
        )

    chunks = []

    for page in pages:
        page_number = page["page_number"]
        text = page.get("text", "")

        if not text.strip():
            continue

        start = 0

        while start < len(text):
            end = min(start + chunk_size, len(text))
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append(
                    {
                        "page_number": page_number,
                        "start_char": start,
                        "end_char": end,
                        "text": chunk_text,
                    }
                )

            if end >= len(text):
                break

            start = end - overlap

    return chunks