import os
import stripe

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

PRO_PRICE_ID = os.environ.get("STRIPE_PRO_PRICE_ID", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://localhost:3000")


def create_checkout_session(user_id: str, email: str, stripe_customer_id: str = None) -> str:
    """Create a Stripe Checkout session and return the URL."""
    params: dict = {
        "mode": "subscription",
        "line_items": [{"price": PRO_PRICE_ID, "quantity": 1}],
        "success_url": f"{FRONTEND_URL}/dashboard?upgraded=true",
        "cancel_url": f"{FRONTEND_URL}/pricing",
        "metadata": {"user_id": user_id},
        "allow_promotion_codes": True,
    }

    if stripe_customer_id:
        params["customer"] = stripe_customer_id
    else:
        params["customer_email"] = email

    session = stripe.checkout.Session.create(**params)
    return session.url


def create_portal_session(stripe_customer_id: str) -> str:
    """Create a Stripe Customer Portal session and return the URL."""
    session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{FRONTEND_URL}/account",
    )
    return session.url


def handle_checkout_completed(session: dict) -> dict:
    """Extract subscription info from checkout.session.completed event."""
    return {
        "stripe_customer_id": session.get("customer"),
        "stripe_subscription_id": session.get("subscription"),
        "user_id": session.get("metadata", {}).get("user_id"),
    }
