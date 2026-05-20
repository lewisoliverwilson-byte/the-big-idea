import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.models.user import User
from app.api.deps import get_current_user_sub
from app.services.stripe_service import (
    create_checkout_session,
    create_portal_session,
)

router = APIRouter(prefix="/billing", tags=["billing"])

STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str


@router.post("/create-checkout-session", response_model=CheckoutResponse)
async def checkout(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    url = create_checkout_session(
        user_id=str(user.id),
        email=user.email,
        stripe_customer_id=user.stripe_customer_id,
    )
    return CheckoutResponse(url=url)


@router.post("/portal", response_model=PortalResponse)
async def portal(
    sub: dict = Depends(get_current_user_sub),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.cognito_id == sub["sub"]).first()
    if not user or not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found")

    url = create_portal_session(user.stripe_customer_id)
    return PortalResponse(url=url)


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        user_id = data.get("metadata", {}).get("user_id")
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.stripe_customer_id = data.get("customer")
                user.stripe_subscription_id = data.get("subscription")
                user.subscription_status = "active"
                from datetime import datetime
                user.plan_started_at = datetime.utcnow()
                db.commit()

    elif event_type in ("customer.subscription.deleted",):
        sub_id = data.get("id")
        user = db.query(User).filter(User.stripe_subscription_id == sub_id).first()
        if user:
            user.subscription_status = "cancelled"
            db.commit()

    elif event_type == "invoice.payment_failed":
        customer_id = data.get("customer")
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if user:
            user.subscription_status = "past_due"
            db.commit()

    elif event_type == "customer.subscription.updated":
        sub_id = data.get("id")
        user = db.query(User).filter(User.stripe_subscription_id == sub_id).first()
        if user:
            status = data.get("status")
            if status == "active":
                user.subscription_status = "active"
            elif status in ("canceled", "cancelled"):
                user.subscription_status = "cancelled"
            elif status == "past_due":
                user.subscription_status = "past_due"
            db.commit()

    return {"status": "ok"}
