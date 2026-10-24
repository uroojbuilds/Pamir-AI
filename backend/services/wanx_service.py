"""
Alibaba Wanx 2.1 marketing-asset service for Pamir AI.

IMPORTANT - READ BEFORE EXTENDING THIS FILE:
As of this implementation, no official Wanx 2.1 API documentation, SDK,
credentials, endpoint URL, or request/response schema exists anywhere in
this project (confirmed by a full-project search). This mirrors the Accio
situation (services/accio_service.py) rather than the Qwen situation
(services/qwen_service.py, which targets a well-documented public API) -
so per instruction this module does NOT invent an endpoint or schema.

NOTE: Wanx ("Tongyi Wanxiang") is generally known to be an image-generation
model family, not a text-copywriting one - which would mean a real
integration might return an image/visual asset rather than text captions.
That is NOT confirmed by anything in this project, so this module does not
commit to either shape. NORMALIZED_ASSET_FIELDS below is illustrative only.

This file is a ready adapter: it defines the configuration/status pattern
(mirroring qwen_service.py and accio_service.py for consistency) and the
exact integration points main.py calls. The real HTTP call is intentionally
NOT implemented - see generate_marketing_assets() below - and will raise
WanxServiceError("unavailable", ...) with a clear explanation until real
API documentation and credentials are provided. Once that happens, only
this file should need to change - main.py's integration points are already
in place and should not need modification.
"""

import os

# NOTE: these env var names are placeholders chosen for clarity/consistency
# with the Qwen/Accio services' naming pattern. They are NOT confirmed
# against real Wanx API documentation (none exists in this project). Rename
# them if the official docs specify different names once available.
WANX_API_KEY = os.getenv("WANX_API_KEY")
WANX_BASE_URL = os.getenv("WANX_BASE_URL")
WANX_TIMEOUT_SECONDS = 12

# Illustrative only - NOT confirmed against real Wanx documentation. Once
# real docs exist, only fields the real API genuinely returns should ever
# be populated here - never invented/guessed.
NORMALIZED_ASSET_FIELDS = [
    "asset_type", "description", "caption", "image_url", "language",
    "source", "source_date", "data_status"
]


class WanxServiceError(Exception):
    """
    category is one of:
      - "not_configured": no WANX_API_KEY set
      - "unavailable": the service could not be used - either a real network/
        timeout failure once implemented, or (currently, always) because the
        real API contract is not yet implemented pending documentation
      - "error": the service was reached but returned something unusable
    Callers must catch this and fall back to local/template content - this
    module never returns a fabricated or partial result on failure.
    """

    def __init__(self, category: str, detail: str = ""):
        self.category = category
        self.detail = detail
        super().__init__(detail or category)


def is_configured() -> bool:
    return bool(WANX_API_KEY)


def generate_marketing_assets(product_data: dict, language: str) -> dict:
    """
    Intended contract for when real documentation/credentials are available:
    given structured product data and a target language, return normalized
    marketing asset(s) (see NORMALIZED_ASSET_FIELDS), sourced live from Wanx,
    tagged source="wanx".

    NOT implemented yet. No verified endpoint URL, authentication header
    format, request schema, or response schema exists for the real Wanx API
    anywhere in this project - this function deliberately does not attempt
    any HTTP call rather than guess at one. Raises WanxServiceError so
    callers fall back to the existing deterministic template content cleanly.
    """
    if not is_configured():
        raise WanxServiceError("not_configured", "WANX_API_KEY is not set.")

    # Intentionally not implemented - see module docstring. Do not guess an
    # endpoint URL, auth header format, or payload/response shape here even
    # though a key is present; the API contract itself is still unknown.
    raise WanxServiceError(
        "unavailable",
        "Wanx integration is architecturally ready but not yet implemented: "
        "no official API documentation or endpoint contract is available in "
        "this project. Provide the real docs/SDK to complete "
        "generate_marketing_assets()."
    )
