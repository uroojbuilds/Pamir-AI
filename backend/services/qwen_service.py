
"""
Gemini reasoning service for Pamir AI.

Gemini only explains structured data already calculated by main.py.
Python remains authoritative for all numerical values.
"""

import os
import json
import httpx
from dotenv import load_dotenv

# Load backend/.env even if the app is started from another folder.
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL") or "gemini-2.5-flash"
GEMINI_TIMEOUT_SECONDS = 20

REQUIRED_RESPONSE_KEYS = {
    "reasoning",
    "strengths",
    "risks",
    "warnings",
    "recommendation",
    "confidence",
}

SYSTEM_PROMPT = """
You are a sourcing/import-viability explainer for Pamir AI,
a tool that helps first-time Pakistani entrepreneurs evaluate
import opportunities from China.

You will receive JSON containing structured data already calculated
by deterministic Python code. You must not change or recalculate
any numerical value.

Rules:
- Use only the supplied data. Never invent market demand, sales,
  competitors, profit guarantees, supplier verification, or regulations.
- Do not change numerical values.
- If data is missing or unavailable, say it must be verified.
- Clearly distinguish verified, curated, estimated, and incomplete data.
- Do not present legal, tax, or customs guidance as authoritative fact.
- Do not invent supplier trust or verification status.

Return only a JSON object with exactly these keys:
{
  "reasoning": "2-4 sentence explanation",
  "strengths": ["strength 1", "strength 2"],
  "risks": ["risk 1", "risk 2"],
  "warnings": ["warning 1"],
  "recommendation": "one or two sentences",
  "confidence": "low, medium, or high"
}
"""


class QwenServiceError(Exception):
    """Kept for compatibility with existing main.py imports."""

    def __init__(self, category: str, detail: str = ""):
        self.category = category
        self.detail = detail
        super().__init__(detail or category)


def is_configured() -> bool:
    return bool(GEMINI_API_KEY)


def explain_viability(structured_data: dict) -> dict:
    """Generate a structured explanation using Gemini."""

    if not GEMINI_API_KEY:
        raise QwenServiceError(
            "not_configured",
            "GEMINI_API_KEY is not set."
        )

    url = (
        "https://generativelanguage.googleapis.com/v1beta/"
        f"models/{GEMINI_MODEL}:generateContent"
    )

    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": json.dumps(
                            structured_data,
                            ensure_ascii=False
                        )
                    }
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.3,
            "responseMimeType": "application/json",
        },
    }

    try:
        response = httpx.post(
            url,
            headers={"x-goog-api-key": GEMINI_API_KEY},
            json=payload,
            timeout=GEMINI_TIMEOUT_SECONDS,
        )
        response.raise_for_status()

    except httpx.TimeoutException as e:
        raise QwenServiceError(
            "unavailable", "Request to Gemini timed out."
        ) from e

    except httpx.HTTPStatusError as e:
        # Do not expose the API key or full request URL in error messages.
        raise QwenServiceError(
            "error", f"Gemini returned HTTP {e.response.status_code}."
        ) from e

    except httpx.RequestError as e:
        # DNS failure, connection refused, network unreachable, etc.
        # Must be caught so /api/business-analysis degrades gracefully
        # (qwen_status="unavailable") instead of returning HTTP 500.
        raise QwenServiceError(
            "unavailable", f"Could not reach Gemini: {type(e).__name__}."
        ) from e


    try:
        body = response.json()
        content = body["candidates"][0]["content"]["parts"][0]["text"]
        parsed = json.loads(content)

    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
        raise QwenServiceError(
            "error", "Gemini response was not valid JSON."
        ) from e

    if not isinstance(parsed, dict):
        raise QwenServiceError(
            "error", "Gemini response was not a JSON object."
        )

    if not REQUIRED_RESPONSE_KEYS.issubset(parsed.keys()):
        raise QwenServiceError(
            "error", "Gemini response was missing required fields."
        )

    if not isinstance(parsed["reasoning"], str):
        raise QwenServiceError("error", "Invalid reasoning field.")

    if not isinstance(parsed["recommendation"], str):
        raise QwenServiceError("error", "Invalid recommendation field.")

    for key in ("strengths", "risks", "warnings"):
        if not isinstance(parsed[key], list) or not all(
            isinstance(item, str) for item in parsed[key]
        ):
            raise QwenServiceError("error", f"Invalid {key} field.")

    if parsed["confidence"] not in ("low", "medium", "high"):
        parsed["confidence"] = "low"

    return {
        "reasoning": parsed["reasoning"],
        "strengths": parsed["strengths"],
        "risks": parsed["risks"],
        "warnings": parsed["warnings"],
        "recommendation": parsed["recommendation"],
        "confidence": parsed["confidence"],
    }
