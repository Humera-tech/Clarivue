
import json
import sys
from pathlib import Path
from statistics import mean

# Allow imports from the backend package when running this script directly.
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.services.evaluation_service import evaluate_retrieval  # noqa: E402


TEST_CASES_PATH = BACKEND_DIR / "evaluation" / "rag_test_cases.json"
REPORT_PATH = BACKEND_DIR / "evaluation" / "rag_evaluation_report.json"


def main() -> None:
    if not TEST_CASES_PATH.exists():
        raise FileNotFoundError(
            f"Test cases file not found: {TEST_CASES_PATH}"
        )

    test_cases = json.loads(TEST_CASES_PATH.read_text(encoding="utf-8"))

    if not isinstance(test_cases, list) or not test_cases:
        raise ValueError("The test cases file must contain a non-empty JSON list.")

    results = []

    for index, case in enumerate(test_cases, start=1):
        question = str(case.get("question", "")).strip()
        document_id = case.get("document_id")

        if not question or not isinstance(document_id, int) or document_id <= 0:
            results.append({
                "case": index,
                "question": question,
                "error": "Each case needs a question and a positive document_id.",
            })
            continue

        try:
            result = evaluate_retrieval(
                question=question,
                document_id=document_id,
                top_k=int(case.get("top_k", 5)),
            )
            results.append({"case": index, **result})
        except Exception as exc:
            results.append({
                "case": index,
                "question": question,
                "document_id": document_id,
                "error": str(exc),
            })

    successful = [item for item in results if "error" not in item]
    with_evidence = [item for item in successful if item["has_evidence"]]
    distances = [
        item["mean_cosine_distance"]
        for item in successful
        if item["mean_cosine_distance"] is not None
    ]

    report = {
        "total_cases": len(test_cases),
        "successful_cases": len(successful),
        "failed_cases": len(test_cases) - len(successful),
        "cases_with_retrieved_evidence": len(with_evidence),
        "evidence_retrieval_rate": (
            round(len(with_evidence) / len(successful), 4)
            if successful else None
        ),
        "mean_retrieved_cosine_distance": (
            round(mean(distances), 4) if distances else None
        ),
        "results": results,
    }

    REPORT_PATH.write_text(
        json.dumps(report, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    print(json.dumps(report, indent=2, ensure_ascii=False))
    print(f"\nReport saved to: {REPORT_PATH}")


if __name__ == "__main__":
    main()
