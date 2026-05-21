"""
Shared FastAPI dependencies — JWT validation via Cognito public keys.
"""
import os
import httpx
from functools import lru_cache
from typing import Optional
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

COGNITO_REGION = os.environ.get("COGNITO_REGION", "us-east-1")
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")
COGNITO_CLIENT_ID = os.environ.get("COGNITO_CLIENT_ID", "")

JWKS_URL = (
    f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/"
    f"{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
)

security = HTTPBearer()


@lru_cache(maxsize=1)
def get_jwks() -> dict:
    resp = httpx.get(JWKS_URL, timeout=10)
    resp.raise_for_status()
    return resp.json()


def decode_token(token: str) -> dict:
    jwks = get_jwks()
    headers = jwt.get_unverified_headers(token)
    kid = headers.get("kid")

    key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
    if not key:
        raise HTTPException(status_code=401, detail="Public key not found")

    try:
        # Cognito ACCESS tokens do not carry an `aud` claim (they have
        # `client_id` instead). Passing audience= here causes python-jose to
        # raise JWTClaimsError on every valid token, so we skip that check and
        # validate client_id + token_use manually below.
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_exp": True, "verify_aud": False},
        )
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    # Validate it really is an access token issued for our app client
    if payload.get("token_use") != "access":
        raise HTTPException(status_code=401, detail="Token must be an access token")
    if COGNITO_CLIENT_ID and payload.get("client_id") != COGNITO_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Token issued for wrong client")

    return payload


def get_current_user_sub(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    return decode_token(credentials.credentials)
