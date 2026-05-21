import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cognito_id = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    subscription_status = Column(
        SAEnum("free", "active", "cancelled", "past_due", name="subscription_status_enum"),
        default="free",
        nullable=False,
    )
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)

    # Free tier: 2 lifetime reports
    reports_used_free = Column(Integer, default=0)

    plan_started_at = Column(DateTime, nullable=True)

    # Pro tier: 20 reports per rolling 7-day window
    pro_reports_used_this_week = Column(Integer, default=0)
    pro_week_reset_at = Column(DateTime, nullable=True)
