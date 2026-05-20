from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from uuid import UUID


class UserOut(BaseModel):
    id: UUID
    email: str
    fullName: Optional[str] = None
    subscriptionStatus: str
    reportsUsedFree: int
    stripeCustomerId: Optional[str] = None
    createdAt: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_model(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            email=user.email,
            fullName=user.full_name,
            subscriptionStatus=user.subscription_status,
            reportsUsedFree=user.reports_used_free,
            stripeCustomerId=user.stripe_customer_id,
            createdAt=user.created_at,
        )
