from pathlib import Path

import fitz
import pytesseract
from PIL import Image


TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_pdf_pages(file_path: str | Path) -> list[dict]:
    """Extract text from regular and scanned PDFs, preserving page numbers."""
    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError("The uploaded PDF could not be found.")

    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    pages = []

    try:
        with fitz.open(path) as pdf:
            if pdf.is_encrypted:
                raise ValueError(
                    "Password-protected PDFs are not supported."
                )

            if len(pdf) == 0:
                raise ValueError("The PDF contains no pages.")

            for page_number, page in enumerate(pdf, start=1):
                text = page.get_text("text").strip()

                # Run OCR if the page has no selectable text.
                if not text:
                    pixmap = page.get_pixmap(
                        matrix=fitz.Matrix(2, 2),
                        alpha=False,
                    )

                    image = Image.frombytes(
                        "RGB",
                        (pixmap.width, pixmap.height),
                        pixmap.samples,
                    )

                    text = pytesseract.image_to_string(image).strip()

                pages.append(
                    {
                        "page_number": page_number,
                        "text": text,
                    }
                )

    except pytesseract.TesseractNotFoundError as exc:
        raise ValueError(
            "Tesseract OCR was not found. Install it or correct "
            "TESSERACT_PATH in pdf_extractor.py."
        ) from exc

    except fitz.FileDataError as exc:
        raise ValueError(
            "The PDF is damaged or cannot be read."
        ) from exc

    if not any(page["text"] for page in pages):
        raise ValueError(
            "No text could be extracted from this PDF, even with OCR."
        )

    return pages