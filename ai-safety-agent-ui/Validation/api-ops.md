# API Operations Guide — Auth, Rate Limits & Errors

This document describes how to authenticate, handle rate limits, and interpret errors for the **UNICC AI Safety Reviewer API**.

## Authentication (OAuth 2.0 + Bearer)
- **Scheme:** HTTP Bearer tokens in the `Authorization` header (`Authorization: Bearer <access_token>`).
- **Standard:** OAuth 2.0 Bearer Token Usage (**RFC 6750**). Protect tokens in transit and at rest; any party in possession of the token can use it.  
- **Token format:** JWT (opaque is also accepted). Recommended JWT claims: `iss`, `aud=unicc-safety-ui`, `sub`, `exp` (≤15m), `scope` (space‑delimited scopes like `review.read review.write evidence.read`), `jti`.
- **Obtaining tokens:** Use your IdP via **Authorization Code with PKCE** (OIDC). Publish **JWKS** with `kid` rotation for verification.
- **Scopes (examples):** `review.read`, `review.write`, `policy.read`, `evidence.read`.

### Sample
```http
GET /v1/review/{id} HTTP/1.1
Host: api.unicc-safety.example
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...
```

## Rate Limits
- **Policy (example buckets):**
  - `ui_read`: **120 req/min**
  - `ui_write`: **60 req/min**
  - `evidence_download`: **10 files/min**
- When a limit is exceeded, the server returns **HTTP 429 Too Many Requests** and **SHOULD** include **`Retry-After`** with seconds until retry.  
- Optionally include draft **RateLimit** headers for better UX (`RateLimit-Policy`, `RateLimit`).

### 429 Example
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 20

{ "code":"RATE_LIMITED","message":"Too many requests",
  "details":[{"field":"-","issue":"burst_exceeded"}],
  "trace_id":"1f9f1f7e-9a1b-4eb7-9e5a-bb8a3f0b2a51" }
```

## Idempotency (POST /v1/review)
- Send `Idempotency-Key: <uuid>` for POSTs to ensure at‑most‑once semantics.
- Reusing the same key with an **identical** body returns the original result; reusing it with a **different** body yields **409 Conflict**.
- Keys expire after 24h (implementation suggestion).

## Error Model
- JSON error envelope:
```json
{
  "code": "BAD_REQUEST",
  "message": "Validation failed",
  "details": [{"field":"input","issue":"required"}],
  "trace_id": "7d1d5a56-3578-44a1-9d2a-6f6c9c0e0a3b"
}
```
- **Canonical codes:** `BAD_REQUEST(400)`, `UNAUTHORIZED(401)`, `FORBIDDEN(403)`, `NOT_FOUND(404)`, `CONFLICT(409)`, `UNPROCESSABLE(422)`, `RATE_LIMITED(429)`, `INTERNAL(500)`, `UNAVAILABLE(503)`.
- Include `trace_id` in every error to correlate client/server logs.
- For future compatibility, the envelope can be mapped to **Problem Details (RFC 9457)**.

## Curl Samples

### Create a review (idempotent)
```bash
curl -X POST https://api.unicc-safety.example/v1/review   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -H "Idempotency-Key: $(uuidgen)"   -d '{
        "input":"Please summarize this web page safely.",
        "context":{"channel":"ui","locale":"en-US"}
      }'
```

### Get a review
```bash
curl -X GET https://api.unicc-safety.example/v1/review/$REVIEW_ID   -H "Authorization: Bearer $TOKEN"
```

### List hazards
```bash
curl -X GET "https://api.unicc-safety.example/v1/policy/hazards?include_decisions=true"   -H "Authorization: Bearer $TOKEN"
```

### Download evidence (ZIP)
```bash
curl -L -X GET https://api.unicc-safety.example/v1/evidence/$REVIEW_ID   -H "Authorization: Bearer $TOKEN"   -H "Accept: application/zip"   -o evidence-$REVIEW_ID.zip
```

## Notes for Reviewers
- **OpenAPI 3.1.0** aligned with **JSON Schema 2020‑12** (validators & contract tests apply).
- **Bearer** per **RFC 6750**; **429** with **Retry‑After** per **RFC 6585** (and HTTP semantics **RFC 9110**).  
- Optional **RateLimit** headers follow IETF draft.  
- **Idempotency-Key** follows the IETF HTTPAPI draft header.

