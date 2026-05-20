"""
Auth endpoints — minimal backend involvement. Cognito handles everything;
we just sync the user to our DB on first login.
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import httpx

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.api.deps import get_current_user_sub

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/sync", response_model=UserOut)
async def sync_user(
    sub: str = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    """
    Called by the frontend after sign-in / sign-up to ensure the user
    exists in our database. Idempotent — safe to call on every login.
    """
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        user = User(
            cognito_id=sub["sub"],
            email=sub.get("email", ""),
            full_name=sub.get("name"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return UserOut.from_orm_model(user)
