import json
import re
import sqlite3
import bcrypt
import jwt
from datetime import datetime, timedelta
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from dotenv import load_dotenv
import os


app = FastAPI()

# Vercel ka filesystem read-only hai (sirf /tmp writable hai). Vercel khud
# apne functions mein "VERCEL=1" env var set karta hai, isliye hum usko
# detect karke sirf wahan /tmp use karte hain - local ya Railway pe pehle
# jaisa hi "users.db" (current folder) use hota hai, koi behavior change nahi.
# NOTE: Vercel serverless hone ki wajah se /tmp bhi permanent nahi hai - yeh
# sirf crash fix karta hai, signup/login data Vercel pe persist nahi rahega.
DB_PATH = "/tmp/users.db" if os.getenv("VERCEL") else "users.db"


# ---- SQLite Database Setup (Users ke liye) ----
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-dev-key-do-not-use-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24

# Qwen import ab load_dotenv() ke baad hai taake DASHSCOPE_API_KEY (agar .env mein hai)
# service module ke load hote hi sahi se pick ho jaye.
from services.qwen_service import explain_viability, is_configured, QwenServiceError
from services.accio_service import (
    discover_products as accio_discover_products,
    is_configured as accio_is_configured,
    AccioServiceError
)
from services.wanx_service import (
    generate_marketing_assets as wanx_generate_marketing_assets,
    is_configured as wanx_is_configured,
    WanxServiceError
)


def create_jwt_token(email: str) -> str:
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)
def verify_token(authorization: str = Header(None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Login required. Token missing.")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme.")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format.")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload["email"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired. Please login again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
# Frontend se connection allow karne ke liye
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Dataset files load karo (server start hote hi ek baar) ----
with open("Data/products.json") as f:
    PRODUCTS = json.load(f)

with open("Data/currency.json") as f:
    CURRENCY = json.load(f)

with open("Data/customs.json") as f:
    CUSTOMS = json.load(f)

with open("Data/shipping.json") as f:
    SHIPPING = json.load(f)

# Verified (interbank) rate use karo
USD_TO_PKR = next(c["rate"] for c in CURRENCY if c["data_status"] == "verified")
USD_TO_PKR_STATUS = "verified"


def usd_to_pkr(usd_amount: float) -> float:
    return round(usd_amount * USD_TO_PKR, 2)


# CNY rate ab currency.json se aata hai (pehle hardcoded tha, ab source/date/status ke saath)
_cny_entry = next(c for c in CURRENCY if c["target_currency"] == "CNY")
USD_TO_CNY = _cny_entry["rate"]
USD_TO_CNY_STATUS = _cny_entry["data_status"]  # e.g. "estimated" - client ko yeh confidence dikhana chahiye


def usd_to_cny(usd_amount: float) -> float:
    return round(usd_amount * USD_TO_CNY, 2)

# Product ID -> Duty rate (customs.json descriptions se manually banaya gaya mapping)

DUTY_RATES = {
    "P001": 20, "P019": 20, "P020": 20, "P025": 20,
    "P005": 20, "P017": 3, "P026": 11,
    "P002": 11, "P009": 11, "P023": 20, "P024": 3,
    "P003": 20,
    "P006": 16, "P010": 16, "P007": 11, "P015": 11, "P021": 3,
    "P004": 20,   # confirmed customs.json (9405.1190)
    "P008": 20,   # confirmed customs.json (8414.5190)
    "P018": 20,   # confirmed customs.json (8536.6990)
    "P011": 20,   # confirmed customs.json (3926.9099)
    "P012": 20,   # confirmed customs.json (3926.9099)
    "P022": 20,   # confirmed customs.json (3926.9099)
    "P013": 20,   # confirmed customs.json (9620.0000)
    "P014": 20,   # confirmed customs.json (9620.0000)
    "P016": 20,   # confirmed customs.json (7007.1900/3919.9090)
}
DEFAULT_DUTY_RATE = 20  # ab sirf tab use hoga jab koi product dictionary mein bilkul na ho

# Product ID -> full customs.json entry (pct_code, duty_rate, source, etc.), derived
# directly from the dataset by parsing the "covers PXXX" mentions in each description.
# Used by /api/import-guidance to surface real, sourced classification info per product.
CUSTOMS_BY_PRODUCT = {}
for _entry in CUSTOMS:
    for _pid in re.findall(r"P\d{3}", _entry["description"]):
        CUSTOMS_BY_PRODUCT[_pid] = _entry

# Fallback sirf agar kabhi weight missing ho (ab real weight_kg hai dataset mein)
ASSUMED_WEIGHT_KG = 0.15

# No official Alibaba Trade Assurance transaction/handoff API, SDK, or endpoint
# documentation exists anywhere in this project (confirmed by a full-project
# search). Unlike Qwen/Accio/Wanx, there is no known external service to adapt
# to, so no services/trade_assurance_service.py was created - it would just
# wrap this constant. "unsupported" (not "not_configured") is used because
# this isn't a missing-credential situation - no such integration is known to
# exist for Pamir AI to configure. This value only changes if a real, verified
# Trade Assurance API/handoff mechanism is confirmed in the future.
TRADE_ASSURANCE_INTEGRATION_STATUS = "unsupported"
TRADE_ASSURANCE_INTEGRATION_NOTE = (
    "Pamir AI does not perform or guarantee Alibaba Trade Assurance transactions. "
    "The trade_assurance field above reflects only what is present in Pamir AI's "
    "sourcing dataset, not an independent verification by Pamir AI. Actual Trade "
    "Assurance integration remains pending official API/access."
)


@app.get("/")
def home():
    return {"message": "Pamir AI backend chal raha hai"}


# ---------------- API: Public Catalog ----------------
# These two endpoints exist so the frontend can render the product catalog,
# tariff/currency reference tables, etc. from the SAME dataset the rest of
# the backend uses, instead of keeping a second, disconnected copy of this
# data hardcoded in the frontend. Read-only reference data, so no auth is
# required (unlike the calculation/analysis endpoints below).
@app.get("/api/catalog")
def get_catalog():
    return {"success": True, "data": PRODUCTS}


@app.get("/api/catalog/{product_id}")
def get_catalog_item(product_id: str):
    product = next((p for p in PRODUCTS if p["product_id"] == product_id), None)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return {"success": True, "data": product}


# ---------------- API: Exchange Rates ----------------
# Returns the SAME verified/curated/estimated rates and sources the backend's
# own /api/landed-cost calculation uses internally - nothing here is
# simulated or randomly jittered. If a rate looks unchanged between polls,
# that's because it genuinely hasn't changed: these are dataset snapshots
# (see source_date), not a live market feed. Presenting them as anything
# more "real-time" than that would be misleading.
_interbank_entry = next(c for c in CURRENCY if c["target_currency"] == "PKR" and c["data_status"] == "verified")
_open_market_entry = next((c for c in CURRENCY if c["target_currency"] == "PKR" and c["data_status"] != "verified"), _interbank_entry)


@app.get("/api/exchange-rates")
def get_exchange_rates():
    return {
        "success": True,
        "data": {
            "usd_pkr_interbank": {
                "rate": _interbank_entry["rate"],
                "data_status": _interbank_entry["data_status"],
                "source": _interbank_entry["source"],
                "source_date": _interbank_entry["source_date"],
            },
            "usd_pkr_open_market": {
                "rate": _open_market_entry["rate"],
                "data_status": _open_market_entry["data_status"],
                "source": _open_market_entry["source"],
                "source_date": _open_market_entry["source_date"],
            },
            "usd_cny": {
                "rate": USD_TO_CNY,
                "data_status": USD_TO_CNY_STATUS,
                "source": _cny_entry["source"],
                "source_date": _cny_entry["source_date"],
            },
            "note": "These are dataset snapshots, refreshed when Pamir AI's data is updated - not a live market feed.",
        },
    }


# ---------------- API 1: Opportunity Discovery ----------------
class OpportunityRequest(BaseModel):
    capital: float
    category: str = "Electronics"


@app.post("/api/opportunity")
def get_opportunities(req: OpportunityRequest, user_email: str = Depends(verify_token)):
    if req.capital <= 0:
        return {"success": False, "message": "Please enter your investment budget.", "error": "Invalid capital value."}

    # Accio discovery is attempted first (per the intended budget-first discovery
    # flow), but discover_products() is not yet implemented against a real API -
    # see services/accio_service.py for why. This call site is wired up now so
    # that once real docs/credentials land, only the service file needs to change.
    # Local dataset results below are ALWAYS used as of now and are always
    # explicitly labeled source="local_dataset" - never mislabeled as Accio data.
    if not accio_is_configured():
        accio_status = "not_configured"
    else:
        try:
            accio_discover_products(req.capital, req.category)
            accio_status = "available"
        except AccioServiceError as e:
            accio_status = e.category  # "not_configured", "unavailable", or "error"

    matches = []
    for p in PRODUCTS:
        if p["supplier_price"] is None or p["data_status"] == "incomplete":
            continue
        if p["category"].lower() != req.category.lower():
            continue

        price_pkr = usd_to_pkr(p["supplier_price"])
        moq = p["moq"] or 1
        total_cost_estimate = price_pkr * moq

        if total_cost_estimate <= req.capital:
            matches.append({
    "product_id": p["product_id"],
    "product_name": p["product_name"],   # "name" ki jagah "product_name"
    "unit_price_pkr": price_pkr,
    "moq": moq,
    "estimated_total_pkr": total_cost_estimate,
    "data_status": p["data_status"],
    "source": "local_dataset"
})

    if not matches:
        return {
            "success": False,
            "message": "No opportunities were found for this budget.",
            "error": "No matching products.",
            "accio_status": accio_status,
            "discovery_source": "local_dataset"
        }

    matches.sort(key=lambda x: (x["data_status"] != "verified", x["estimated_total_pkr"]))
    return {
        "success": True,
        "data": matches[:3],
        "accio_status": accio_status,
        "discovery_source": "local_dataset"
    }


# ---------------- API 2: Landed Cost ----------------
class LandedCostRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, gt=0)
    target_currency: str = "PKR"   # "PKR" ya "CNY" - user choose kar sakta hai


@app.post("/api/landed-cost")
def get_landed_cost(req: LandedCostRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}
    if product["supplier_price"] is None:
        return {"success": False, "message": "Product exists, but price data is unavailable for it.", "error": "Price data unavailable."}

    # Sabse sasti shipping method use karo (Air, per kg)
    air_shipping = next((s for s in SHIPPING if s["shipping_method"].lower() == "air"), SHIPPING[0])

    # Real weight dataset se lo, agar kabhi missing ho to fallback use karo
    unit_weight = product["weight_kg"] if product["weight_kg"] is not None else ASSUMED_WEIGHT_KG
    total_weight = unit_weight * req.quantity

    shipping_cost_usd = air_shipping["estimated_cost"] * total_weight

    # duty_rate_source batata hai ke ye rate customs.json-mapped dict se aayi hai
    # ya kyunke product dict mein bilkul nahi mila, isliye default fallback use hua
    if req.product_id in DUTY_RATES:
        duty_rate = DUTY_RATES[req.product_id]
        duty_rate_source = "confirmed"
    else:
        duty_rate = DEFAULT_DUTY_RATE
        duty_rate_source = "default_fallback"

        # User ke chune hue currency mein convert karo
    currency = req.target_currency.upper()
    if currency == "CNY":
        conversion_rate = USD_TO_CNY
        exchange_rate_status = USD_TO_CNY_STATUS
    else:
        currency = "PKR"
        conversion_rate = USD_TO_PKR
        exchange_rate_status = USD_TO_PKR_STATUS

    product_cost_final = round(product["supplier_price"] * req.quantity * conversion_rate, 2)
    shipping_cost_final = round(shipping_cost_usd * conversion_rate, 2)
    customs_cost_final = round((product["supplier_price"] * req.quantity) * (duty_rate / 100) * conversion_rate, 2)
    total_final = round(product_cost_final + shipping_cost_final + customs_cost_final, 2)

    if product["weight_kg"] is not None:
        weight_note = f"Weight sourced from dataset (data_status: {product['data_status']})."
    else:
        weight_note = "Weight estimated (missing in dataset)."

    return {
        "success": True,
        "data": {
            "product_id": req.product_id,
            "currency_used": currency,
            "exchange_rate": conversion_rate,
            "exchange_rate_status": exchange_rate_status,
            "product_cost": product_cost_final,
            "shipping_cost": shipping_cost_final,
            "duty_rate_percent": duty_rate,
            "duty_rate_source": duty_rate_source,
            "customs_cost": customs_cost_final,
            "total_landed_cost": total_final,
            "weight_used_kg": round(total_weight, 3),
            "note": weight_note
        }
    }


# ---------------- API 3: Business Viability ----------------
class ViabilityRequest(BaseModel):
    product_id: str


@app.post("/api/business-analysis")
def get_business_viability(req: ViabilityRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}

    score = 50  # base score

    if product["data_status"] == "verified":
        score += 30
    elif product["data_status"] == "curated":
        score += 15
    else:  # incomplete
        score -= 20

    if product["trade_assurance"] is True:
        score += 15
    elif product["trade_assurance"] is None:
        score += 0
    else:
        score -= 10

    moq = product["moq"] or 1
    if moq <= 20:
        score += 5
    elif moq >= 500:
        score -= 10

    score = max(0, min(100, score))

    if score >= 75:
        risk_summary = "Low risk — verified data and manageable order quantity."
    elif score >= 50:
        risk_summary = "Moderate risk — some data gaps or higher order commitment."
    else:
        risk_summary = "Higher risk — limited data confidence, verify before committing."

    moq_level = "Low" if moq <= 20 else ("Medium" if moq < 500 else "High")

    # Qwen is an ADDITIVE explanation layer only. It never changes score/risk_summary/
    # moq_level/etc above - those are already final by this point. Qwen only gets to
    # explain them, and only if configured and reachable; otherwise we fall back to
    # deterministic-only output and say so explicitly via qwen_status.
    structured_data_for_qwen = {
        "product_id": product["product_id"],
        "product_name": product["product_name"],
        "category": product["category"],
        "viability_score": score,
        "data_confidence": product["data_status"],
        "trade_assurance_status": product["trade_assurance"],
        "moq": moq,
        "moq_level": moq_level,
        "supplier_price_usd": product["supplier_price"],
        "risk_summary": risk_summary
    }

    ai_explanation = None
    if not is_configured():
        qwen_status = "not_configured"
    else:
        try:
            ai_explanation = explain_viability(structured_data_for_qwen)
            qwen_status = "available"
        except QwenServiceError as e:
            qwen_status = e.category  # "unavailable" or "error" - never "available" on failure
            ai_explanation = None

    return {
        "success": True,
        "data": {
            "product_id": req.product_id,
            "viability_score": score,
            "data_confidence": product["data_status"],
            "trade_assurance_status": product["trade_assurance"],
            "moq_level": moq_level,
            "risk_summary": risk_summary,
            "qwen_status": qwen_status,
            "ai_explanation": ai_explanation
        }
    }
# ---------------- API 4: Supplier Info ----------------
class SupplierRequest(BaseModel):
    product_id: str


@app.post("/api/supplier-info")
def get_supplier_info(req: SupplierRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}

    return {
        "success": True,
        "data": {
            "product_id": product["product_id"],
            "product_name": product["product_name"],
            "supplier_id": product["supplier_id"],
            "supplier_name": product["supplier_name"],
            "trade_assurance": product["trade_assurance"],
            "trade_assurance_integration_status": TRADE_ASSURANCE_INTEGRATION_STATUS,
            "source": product["source"],
            "source_date": product["source_date"],
            "data_status": product["data_status"]
        }
    }


# ---------------- API 5: Supplier Matching ----------------
class SupplierMatchRequest(BaseModel):
    capital: float
    category: str = "Electronics"


@app.post("/api/supplier-match")
def get_supplier_matches(req: SupplierMatchRequest, user_email: str = Depends(verify_token)):
    if req.capital <= 0:
        return {"success": False, "message": "Please enter your investment budget.", "error": "Invalid capital value."}

    # IMPORTANT: this dataset has exactly one supplier embedded per product (verified during
    # implementation - 26 products, 26 unique supplier_id's, no supplier shared across products).
    # "Matching suppliers" here therefore means finding multiple qualifying product+supplier
    # pairs for the user's budget/category - NOT multiple competing suppliers for one product,
    # since that data does not exist in the dataset and we do not fabricate it.
    matches = []
    for p in PRODUCTS:
        if p["supplier_price"] is None or p["data_status"] == "incomplete":
            continue
        if p["category"].lower() != req.category.lower():
            continue

        price_pkr = usd_to_pkr(p["supplier_price"])
        moq = p["moq"] or 1
        estimated_total_pkr = price_pkr * moq

        if estimated_total_pkr > req.capital:
            continue

        # Deterministic match score - same scoring philosophy as /api/business-analysis,
        # kept in Python (not the LLM) since this is simple, explainable filtering/sorting.
        score = 50
        if p["data_status"] == "verified":
            score += 30
        elif p["data_status"] == "curated":
            score += 15

        # Never claim "verified supplier" from a null trade_assurance value - label it
        # as unavailable instead of guessing. Wording reflects only what the dataset
        # says, not an independent Pamir AI verification claim.
        if p["trade_assurance"] is True:
            score += 15
            trade_assurance_label = "Trade Assurance available in dataset"
        elif p["trade_assurance"] is False:
            score -= 10
            trade_assurance_label = "Trade Assurance not indicated"
        else:
            trade_assurance_label = "Trade Assurance status unavailable"

        if moq <= 20:
            score += 5
        elif moq >= 500:
            score -= 10

        score = max(0, min(100, score))

        matches.append({
            "product_id": p["product_id"],
            "product_name": p["product_name"],
            "supplier_id": p["supplier_id"],
            "supplier_name": p["supplier_name"],
            "unit_price_pkr": price_pkr,
            "moq": moq,
            "estimated_total_pkr": estimated_total_pkr,
            "trade_assurance": p["trade_assurance"],
            "trade_assurance_label": trade_assurance_label,
            "trade_assurance_integration_status": TRADE_ASSURANCE_INTEGRATION_STATUS,
            "data_status": p["data_status"],
            "match_score": score,
            "source": p["source"],
            "source_date": p["source_date"]
        })

    if not matches:
        return {"success": False, "message": "No suppliers matched this budget and category.", "error": "No matching suppliers."}

    matches.sort(key=lambda m: (-m["match_score"], m["estimated_total_pkr"]))
    return {"success": True, "data": matches[:5]}


# ---------------- API 6: RFQ Generation ----------------
class RFQRequest(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    shipping_destination: str = "Pakistan"
    target_price_usd: float | None = None


@app.post("/api/rfq")
def generate_rfq(req: RFQRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}

    # NOTE: unlike /api/landed-cost and /api/launch-kit, we do NOT block RFQ generation
    # when supplier_price is missing - an RFQ's actual purpose is to ask the supplier for
    # a price when one isn't already known. We label the missing price honestly instead
    # of blocking or inventing a number.
    moq = product["moq"]
    meets_moq = (moq is None) or (req.quantity >= moq)
    moq_note = None
    if moq is not None and req.quantity < moq:
        moq_note = (
            f"Requested quantity ({req.quantity}) is below the supplier's stated MOQ "
            f"({moq}). You may need to increase the order quantity or negotiate a lower "
            f"MOQ directly with the supplier."
        )

    if product["supplier_price"] is not None:
        reference_unit_price_usd = product["supplier_price"]
        price_source = "dataset_reference"
        estimated_reference_total_usd = round(product["supplier_price"] * req.quantity, 2)
    else:
        reference_unit_price_usd = None
        price_source = "data_unavailable"
        estimated_reference_total_usd = None

    if req.target_price_usd is not None:
        target_price_usd = req.target_price_usd
        target_price_source = "user_specified"
    else:
        target_price_usd = None
        target_price_source = "not_specified"

    if product["trade_assurance"] is True:
        trade_assurance_label = "Trade Assurance available in dataset"
    elif product["trade_assurance"] is False:
        trade_assurance_label = "Trade Assurance not indicated"
    else:
        trade_assurance_label = "Trade Assurance status unavailable"

    specifications = {
        "moq": moq if moq is not None else "Data unavailable",
        "weight_kg": product["weight_kg"] if product["weight_kg"] is not None else "Data unavailable",
        "note": "Only fields confirmed in the sourcing dataset are shown. Pamir AI does not fabricate product specifications."
    }

    # Fixed, templated supplier questions - not fabricated product/supplier data, just
    # standard boilerplate a first-time importer should ask. Adjusted based on what's
    # actually missing for this specific product.
    supplier_questions = [
        f"Can you confirm your best FOB/unit price for a quantity of {req.quantity}?",
        "What is your minimum order quantity (MOQ) and does it apply per color/variant?",
        "What are the accepted payment terms (T/T, L/C, Trade Assurance)?",
        f"What is the estimated lead time to ship to {req.shipping_destination}?",
        "Can you provide product certifications/compliance documents relevant to this category?",
        "Is a sample available before placing a bulk order, and what is the sample cost/lead time?"
    ]
    if product["supplier_price"] is None:
        supplier_questions.insert(0, "Our records do not show a confirmed unit price for this product — please share your current quotation.")

    rfq_id = f"RFQ-{product['product_id']}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    return {
        "success": True,
        "data": {
            "rfq_id": rfq_id,
            "product_id": product["product_id"],
            "product_name": product["product_name"],
            "category": product["category"],
            "specifications": specifications,
            "supplier_id": product["supplier_id"],
            "supplier_name": product["supplier_name"],
            "trade_assurance": product["trade_assurance"],
            "trade_assurance_label": trade_assurance_label,
            "trade_assurance_integration_status": TRADE_ASSURANCE_INTEGRATION_STATUS,
            "trade_assurance_integration_note": TRADE_ASSURANCE_INTEGRATION_NOTE,
            "requested_quantity": req.quantity,
            "moq": moq,
            "meets_moq": meets_moq,
            "moq_note": moq_note,
            "reference_unit_price_usd": reference_unit_price_usd,
            "price_source": price_source,
            "target_price_usd": target_price_usd,
            "target_price_source": target_price_source,
            "estimated_reference_total_usd": estimated_reference_total_usd,
            "shipping_destination": req.shipping_destination,
            "data_status": product["data_status"],
            "source": product["source"],
            "source_date": product["source_date"],
            "supplier_questions": supplier_questions,
            "note": "This RFQ is generated from Pamir AI's internal sourcing dataset for supplier outreach preparation. It is not a live quotation and does not constitute a transaction."
        }
    }


# ---------------- API 7: Import Guidance ----------------
class ImportGuidanceRequest(BaseModel):
    product_id: str


@app.post("/api/import-guidance")
def get_import_guidance(req: ImportGuidanceRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}

    # Customs section - the ONLY genuinely regulatory data this project actually has
    # (sourced to FBR First Schedule in Data/customs.json). Everything else below is
    # either general procedural awareness ("guidance") or explicitly "unavailable" -
    # never presented as a confirmed legal requirement.
    customs_entry = CUSTOMS_BY_PRODUCT.get(req.product_id)
    if customs_entry is not None:
        customs = {
            "data_status": "confirmed",
            "pct_code": customs_entry["pct_code"],
            "duty_rate_percent": customs_entry["duty_rate"],
            "classification_note": customs_entry["description"],
            "source": customs_entry["source"],
            "source_date": customs_entry["source_date"]
        }
    else:
        customs = {
            "data_status": "unavailable",
            "pct_code": None,
            "duty_rate_percent": None,
            "classification_note": None,
            "source": None,
            "source_date": None,
            "note": "Data unavailable \u2014 verify tariff classification and duty rate with FBR or a licensed customs clearing agent."
        }

    before_ordering = [
        {"item": "Confirm the supplier's final quotation and payment terms", "data_status": "guidance"},
        {"item": "Check the estimated landed cost via /api/landed-cost before committing capital", "data_status": "guidance"},
        {"item": "Review the business viability score via /api/business-analysis", "data_status": "guidance"},
        {"item": "Request a product sample before placing a bulk order", "data_status": "guidance"}
    ]

    # Named institutions (NTN, WeBOC, sales tax) are real, well-known parts of Pakistan's
    # import process - naming them is not the same as asserting specific requirements.
    # No specific rule, threshold, exemption, or step is claimed; each is explicitly
    # flagged as unverified by Pamir AI and deferred to the relevant authority.
    documentation = [
        {
            "item": "Import registration / National Tax Number (NTN) with FBR",
            "data_status": "guidance",
            "note": "Data unavailable in Pamir AI's dataset \u2014 verify current requirements with FBR."
        },
        {
            "item": "WeBOC account for customs declaration/clearance",
            "data_status": "guidance",
            "note": "Data unavailable in Pamir AI's dataset \u2014 verify current requirements with FBR or a licensed customs clearing agent."
        },
        {
            "item": "Sales tax registration (if applicable to your business)",
            "data_status": "guidance",
            "note": "Requirements vary by business type and turnover. Data unavailable in Pamir AI's dataset \u2014 verify with FBR."
        },
        {
            "item": "Product-specific compliance/safety certification",
            "data_status": "unavailable",
            "note": "Data unavailable \u2014 verify whether this product category requires regulatory certification before import."
        }
    ]

    supplier_checks = [
        {
            "item": "Confirm supplier Trade Assurance status",
            "data_status": "confirmed" if product["trade_assurance"] is not None else "unavailable",
            "value": product["trade_assurance"]
        },
        {
            "item": "Confirm supplier/product data confidence",
            "data_status": "confirmed",
            "value": product["data_status"]
        },
        {
            "item": "Verify supplier MOQ against your planned order quantity",
            "data_status": "confirmed" if product["moq"] is not None else "unavailable",
            "value": product["moq"]
        },
        {
            "item": "Verify current unit price directly with supplier before ordering",
            "data_status": "confirmed" if product["supplier_price"] is not None else "unavailable",
            "value": product["supplier_price"]
        }
    ]

    warnings = []
    if product["data_status"] == "incomplete":
        warnings.append("This product's sourcing data is incomplete. Verify price, MOQ, and specifications directly with the supplier before proceeding.")
    if product["trade_assurance"] is None:
        warnings.append("Trade Assurance status is unavailable for this supplier. Verify buyer protection options directly before ordering.")
    if product["supplier_price"] is None:
        warnings.append("No confirmed unit price is available for this product in Pamir AI's dataset. Use /api/rfq to request a quotation from the supplier.")
    if customs_entry is None:
        warnings.append("No customs classification is available for this product. Duty rate and PCT code must be confirmed independently before import.")
    elif "note:" in customs_entry["source"].lower():
        warnings.append("This product's customs classification involves some ambiguity per the sourced data \u2014 see classification_note. Confirm the exact PCT code with a customs agent before shipment.")

    data_sources = []
    if customs_entry is not None:
        data_sources.append({"topic": "Customs duty & classification", "source": customs_entry["source"], "source_date": customs_entry["source_date"]})
    data_sources.append({"topic": "Product & supplier data", "source": product["source"], "source_date": product["source_date"]})

    return {
        "success": True,
        "data": {
            "product_id": product["product_id"],
            "product_name": product["product_name"],
            "category": product["category"],
            "guidance_status": "Mixed \u2014 some fields are confirmed from sourced data, others require independent verification (see data_status per item).",
            "before_ordering": before_ordering,
            "customs": customs,
            "documentation": documentation,
            "supplier_checks": supplier_checks,
            "warnings": warnings,
            "data_sources": data_sources,
            "disclaimer": "Pamir AI does not provide legal, tax, or customs advice. This guidance reflects only the data available in Pamir AI's sourcing dataset and does not cover all regulatory, licensing, certification, or compliance requirements for importing into Pakistan. Always verify current requirements with FBR, WeBOC, the State Bank of Pakistan, or a licensed customs clearing agent before placing an order."
        }
    }


# ---------------- API: Signup ----------------
class SignupRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/api/signup")
def signup(req: SignupRequest):
    if len(req.password) < 6:
        return {"success": False, "message": "Password kam se kam 6 characters ka hona chahiye.", "error": "Weak password."}

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        conn.close()
        return {"success": False, "message": "Ye email pehle se registered hai.", "error": "Email already exists."}

    password_hash = bcrypt.hashpw(req.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    cursor.execute(
        "INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
        (req.email, password_hash, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()

    token = create_jwt_token(req.email)
    return {"success": True, "data": {"email": req.email, "token": token, "message": "Account successfully bana diya gaya."}}


# ---------------- API: Login ----------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.post("/api/login")
def login(req: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT password_hash FROM users WHERE email = ?", (req.email,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return {"success": False, "message": "Email ya password ghalat hai.", "error": "Invalid credentials."}

    if not bcrypt.checkpw(req.password.encode("utf-8"), row[0].encode("utf-8")):
        return {"success": False, "message": "Email ya password ghalat hai.", "error": "Invalid credentials."}

    token = create_jwt_token(req.email)
    return {"success": True, "data": {"email": req.email, "token": token, "message": "Login successful."}}
# ---------------- API: Marketing ----------------
class MarketingRequest(BaseModel):
    product_id: str
    language: str = "english"   # "english" ya "urdu","roman_urdu"


@app.post("/api/marketing")
def get_marketing_content(req: MarketingRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}

    name = product["product_name"]   # <-- YE LINE ZAROOR HONI CHAHIYE

    if req.language.lower() == "urdu":
        description = f"{name} — behtareen quality, munasib qeemat par ab dastiyab hai!"
        caption = f"🔥 {name} order karein aaj hi! Mehdood stock, jaldi karein."
    elif req.language.lower() == "roman_urdu":
        description = f"{name} — sasti price mein best quality! Order karo abhi."
        caption = f"🔥 {name} sirf limited stock mein! Order karne ke liye message karein."
    else:
        description = f"Introducing the {name} — premium quality at an unbeatable price."
        caption = f"🔥 Get your {name} today! Limited stock available."

    # Wanx is attempted first (per the intended Marketing Studio flow), but
    # generate_marketing_assets() is not yet implemented against a real API -
    # see services/wanx_service.py for why. This call site is wired up now so
    # that once real docs/credentials land, only the service file needs to
    # change. The deterministic template content above is ALWAYS used as of
    # now and is always explicitly labeled source="fallback" - never
    # mislabeled as Wanx-generated.
    if not wanx_is_configured():
        wanx_status = "not_configured"
    else:
        try:
            wanx_generate_marketing_assets(
                {"product_id": product["product_id"], "product_name": name, "category": product["category"]},
                req.language
            )
            wanx_status = "available"
        except WanxServiceError as e:
            wanx_status = e.category  # "not_configured", "unavailable", or "error"

    return {
        "success": True,
        "data": {
            "product_id": req.product_id,
            "product_name": name,
            "language": req.language,
            "product_description": description,
            "social_media_caption": caption,
            "source": "fallback",
            "wanx_status": wanx_status
        }
    }
# ---------------- API: Launch Kit ----------------
class LaunchKitRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, gt=0)


@app.post("/api/launch-kit")
def get_launch_kit(req: LaunchKitRequest, user_email: str = Depends(verify_token)):
    product = next((p for p in PRODUCTS if p["product_id"] == req.product_id), None)

    if product is None:
        return {"success": False, "message": "Product not found.", "error": "Invalid product_id."}
    if product["supplier_price"] is None:
        return {"success": False, "message": "Product exists, but price data is unavailable for it.", "error": "Price data unavailable."}

    # Landed cost calculate karo
    unit_price_pkr = usd_to_pkr(product["supplier_price"])
    product_cost = unit_price_pkr * req.quantity
    air_shipping = next((s for s in SHIPPING if s["shipping_method"].lower() == "air"), SHIPPING[0])
    unit_weight = product["weight_kg"] if product["weight_kg"] is not None else ASSUMED_WEIGHT_KG
    total_weight = unit_weight * req.quantity
    shipping_cost_pkr = usd_to_pkr(air_shipping["estimated_cost"] * total_weight)
    if req.product_id in DUTY_RATES:
        duty_rate = DUTY_RATES[req.product_id]
        duty_rate_source = "confirmed"
    else:
        duty_rate = DEFAULT_DUTY_RATE
        duty_rate_source = "default_fallback"
    customs_cost = product_cost * (duty_rate / 100)
    total_landed_cost = product_cost + shipping_cost_pkr + customs_cost

    # Viability score calculate karo
    score = 50
    if product["data_status"] == "verified":
        score += 30
    elif product["data_status"] == "curated":
        score += 15
    else:
        score -= 20
    if product["trade_assurance"] is True:
        score += 15
    elif product["trade_assurance"] is False:
        score -= 10
    moq = product["moq"] or 1
    if moq <= 20:
        score += 5
    elif moq >= 500:
        score -= 10
    score = max(0, min(100, score))

    # Marketing content
    description = f"Introducing the {product['product_name']} — premium quality at an unbeatable price."
    caption = f"🔥 Get your {product['product_name']} today! Limited stock available."

    # Same Wanx attempt + fallback pattern as /api/marketing - see that endpoint
    # for the full explanation. Deterministic template text above is always used
    # as of now, always labeled source="fallback".
    if not wanx_is_configured():
        wanx_status = "not_configured"
    else:
        try:
            wanx_generate_marketing_assets(
                {"product_id": product["product_id"], "product_name": product["product_name"], "category": product["category"]},
                "english"
            )
            wanx_status = "available"
        except WanxServiceError as e:
            wanx_status = e.category

    # Checklist (fixed steps)
    checklist = [
        "Request a sample from the supplier before bulk ordering",
        "Confirm final quotation and payment terms",
        "Verify shipping method and expected delivery time",
        "Prepare marketing assets before product arrival",
        "Set up sales channel (online store / social media page)"
    ]

    return {
        "success": True,
        "data": {
            "product_id": req.product_id,
            "product_name": product["product_name"],
            "supplier_name": product["supplier_name"],
            "quantity": req.quantity,
            "cost_summary": {
                "product_cost_pkr": round(product_cost, 2),
                "shipping_cost_pkr": round(shipping_cost_pkr, 2),
                "duty_rate_percent": duty_rate,
                "duty_rate_source": duty_rate_source,
                "customs_cost_pkr": round(customs_cost, 2),
                "total_landed_cost_pkr": round(total_landed_cost, 2)
            },
            "viability_score": score,
            "marketing": {
                "description": description,
                "caption": caption,
                "source": "fallback",
                "wanx_status": wanx_status
            },
            "import_checklist": checklist
        }
    }