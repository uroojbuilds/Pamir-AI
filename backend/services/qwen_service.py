"""
Qwen3 reasoning service for Pamir AI.

This module is the ONLY place in the project that reads the Qwen API key or talks
to the Qwen API. main.py never sees the key directly and never builds the HTTP
request itself - it only calls explain_viability() and handles QwenServiceError.

Qwen is used ONLY to explain structured data that the deterministic business-
viability engine in main.py has already computed. It never invents or overrides
a numerical value - Python remains authoritative for every number. This module
enforces that boundary through the system prompt and by validating the response
shape before returning it.
"""

import os
import json
import httpx

QWEN_API_KEY = os.getenv("DASHSCOPE_API_KEY")
QWEN_MODEL = os.getenv("QWEN_MODEL") or "qwen-plus"
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL") or "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
QWEN_TIMEOUT_SECONDS = 12

REQUIRED_RESPONSE_KEYS = {"reasoning", "strengths", "risks", "warnings", "recommendation", "confidence"}

SYSTEM_PROMPT = """You are a sourcing/import-viability explainer for Pamir AI, a tool that helps first-time Pakistani entrepreneurs evaluate import opportunities from China.

You will be given a JSON object of structured, already-computed data about ONE product opportunity. This data was calculated by deterministic Python code, not by you. You must NOT change, recompute, or contradict any numerical value in it.

STRICT RULES:
- Use ONLY the structured data provided. Do not invent market demand, sales volume, competitors, profit guarantees, supplier verification status, or customs/legal requirements that are not present in the data.
- Do not change any numerical value (viability_score, prices, duty rates, etc.) supplied to you.
- If a field's value is null, missing, or explicitly marked as unavailable/incomplete in the data, say so plainly ("Data unavailable - verify before making a business decision.") rather than guessing or filling it in.
- Clearly distinguish data marked "verified" from data marked "curated," "estimated," or "incomplete" - do not present estimated or curated data with the same confidence as verified data.
- Do not give legal, tax, or customs advice as authoritative fact. If the data includes guidance-level or unavailable regulatory information, describe it as something the user must verify with the relevant authority, not as settled fact.
- Do not fabricate supplier trust or verification status beyond what the data states.

Respond ONLY with a single JSON object matching exactly this schema, and nothing else (no markdown fences, no preamble, no extra keys):
{
  "reasoning": "2-4 sentence plain-language explanation of the opportunity, grounded only in the supplied data",
  "strengths": ["short strength 1", "short strength 2"],
  "risks": ["short risk 1", "short risk 2"],
  "warnings": ["short warning 1"],
  "recommendation": "one or two sentence recommendation",
  "confidence": "low, medium, or high"
}
"""


class QwenServiceError(Exception):
    """
    Raised for any Qwen-related failure. `category` is one of:
      - "not_configured": no API key is set
      - "unavailable": the service could not be reached (network/timeout)
      - "error": the service was reached but returned something unusable
    Callers must catch this and fall back to deterministic-only output - this
    module never returns a partial or fabricated result on failure.
    """

    def __init__(self, category: str, detail: str = ""):
        self.category = category
        self.detail = detail
        super().__init__(detail or category)


def is_configured() -> bool:
    return bool(QWEN_API_KEY)


def explain_viability(structured_data: dict) -> dict:
    """
    Calls Qwen3 to explain a structured viability payload that main.py's
    deterministic engine has already computed. Returns a dict matching
    REQUIRED_RESPONSE_KEYS, or raises QwenServiceError.
    """
    if not QWEN_API_KEY:
        raise QwenServiceError("not_configured", "DASHSCOPE_API_KEY is not set.")

    payload = {
        "model": QWEN_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps(structured_data)}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.3
    }
    headers = {
        "Authorization": f"Bearer {QWEN_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = httpx.post(
            f"{QWEN_BASE_URL}/chat/completions",
            json=payload,
            headers=headers,
            timeout=QWEN_TIMEOUT_SECONDS
        )
        response.raise_for_status()
    except httpx.TimeoutException as e:
        raise QwenServiceError("unavailable", "Request to Qwen timed out.") from e
    except httpx.HTTPStatusError as e:
        raise QwenServiceError("error", f"Qwen returned HTTP {e.response.status_code}.") from e
    except httpx.RequestError as e:
        # Covers DNS failure, connection refused, network unreachable, etc.
        raise QwenServiceError("unavailable", f"Could not reach Qwen: {type(e).__name__}.") from e

    try:
        body = response.json()
        content = body["choices"][0]["message"]["content"]
        parsed = json.loads(content)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as e:
        raise QwenServiceError("error", "Qwen response was not valid JSON in the expected shape.") from e

    if not isinstance(parsed, dict) or not REQUIRED_RESPONSE_KEYS.issubset(parsed.keys()):
        raise QwenServiceError("error", "Qwen response was missing required fields.")

    return {
        "reasoning": parsed.get("reasoning", ""),
        "strengths": parsed.get("strengths") or [],
        "risks": parsed.get("risks") or [],
        "warnings": parsed.get("warnings") or [],
        "recommendation": parsed.get("recommendation", ""),
        "confidence": parsed.get("confidence", "unknown")
    }
