from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserOut
from app.api.deps import get_current_user_sub

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me", response_model=UserOut)
async def get_me(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.from_orm_model(user)


@router.delete("/me")
async def delete_account(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Delete all user reports (cascade would handle this but being explicit)
    from app.models.report import Report
    db.query(Report).filter(Report.user_id == user.id).delete()
    db.delete(user)
    db.commit()
    return {"status": "deleted"}
