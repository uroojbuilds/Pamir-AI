"""
Alibaba Accio sourcing/discovery service for Pamir AI.

IMPORTANT - READ BEFORE EXTENDING THIS FILE:
As of this implementation, no official Alibaba Accio API documentation, SDK,
credentials, endpoint URL, or request/response schema exists anywhere in this
project (confirmed by a full-project search). This is different from the
Qwen integration (services/qwen_service.py), which targets a well-documented
public API. For Accio, no such verified public developer-API contract is
available, so per instruction this module does NOT invent one.

This file is a ready adapter: it defines the normalized output contract, the
configuration/status pattern (mirroring qwen_service.py for consistency),
and the exact integration point main.py calls. The real HTTP call is
intentionally NOT implemented - see discover_products() below - and will
raise AccioServiceError("unavailable", ...) with a clear explanation until
real API documentation and credentials are provided. Once that happens, only
this file should need to change - main.py's integration point is already
in place and should not need modification.
"""

import os

# NOTE: these env var names are placeholders chosen for clarity/consistency
# with the Qwen service's naming pattern. They are NOT confirmed against real
# Accio API documentation (none exists in this project). Rename them if the
# official docs specify different names once they're available.
ACCIO_API_KEY = os.getenv("ACCIO_API_KEY")
ACCIO_BASE_URL = os.getenv("ACCIO_BASE_URL")
ACCIO_TIMEOUT_SECONDS = 12

# Fields a normalized Accio result will carry once discover_products() is
# actually implemented against real documentation. Only fields the real API
# genuinely returns should ever be populated - never invented/guessed.
# Callers must be able to tell live Accio data apart from local dataset
# fallback via source="accio" / data_status="live_external".
NORMALIZED_FIELDS = [
    "product_id", "product_name", "product_url", "supplier_id", "supplier_name",
    "supplier_price", "currency", "moq", "category", "trust_signal",
    "source", "source_date", "data_status"
]


class AccioServiceError(Exception):
    """
    category is one of:
      - "not_configured": no ACCIO_API_KEY set
      - "unavailable": the service could not be used - either a real network/
        timeout failure once implemented, or (currently, always) because the
        real API contract is not yet implemented pending documentation
      - "error": the service was reached but returned something unusable
    Callers must catch this and fall back to local/demo data - this module
    never returns a fabricated or partial result on failure.
    """

    def __init__(self, category: str, detail: str = ""):
        self.category = category
        self.detail = detail
        super().__init__(detail or category)


def is_configured() -> bool:
    return bool(ACCIO_API_KEY)


def discover_products(capital: float, category: str, preferences: dict | None = None) -> list:
    """
    Intended contract for when real documentation/credentials are available:
    given a budget, category, and optional preferences, return a list of
    normalized product/supplier dicts (see NORMALIZED_FIELDS), sourced live
    from Accio, each tagged source="accio", data_status="live_external".

    NOT implemented yet. No verified endpoint URL, authentication header
    format, request schema, or response schema exists for the real Accio API
    anywhere in this project - this function deliberately does not attempt
    any HTTP call rather than guess at one. Raises AccioServiceError so
    callers fall back to local dataset results cleanly.
    """
    if not is_configured():
        raise AccioServiceError("not_configured", "ACCIO_API_KEY is not set.")

    # Intentionally not implemented - see module docstring. Do not guess an
    # endpoint URL, auth header format, or payload/response shape here even
    # though a key is present; the API contract itself is still unknown.
    raise AccioServiceError(
        "unavailable",
        "Accio integration is architecturally ready but not yet implemented: "
        "no official API documentation or endpoint contract is available in "
        "this project. Provide the real docs/SDK to complete discover_products()."
    )
