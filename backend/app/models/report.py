import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Enum as SAEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.db.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)

    # User input params
    search_budget_usd = Column(Numeric(10, 2))
    search_unit_size = Column(String)
    search_category = Column(String)
    search_additional_params = Column(JSONB, default={})

    # Status
    status = Column(
        SAEnum("processing", "ready", "failed", name="report_status_enum"),
        default="processing",
    )

    # Report tier: 'free' (lite analysis, 1 platform) or 'pro' (full analysis, all platforms)
    tier = Column(String, default="free", nullable=False)

    # Computed fields
    margin_analysis = Column(JSONB)
    platform_comparison = Column(JSONB)
    ai_analysis = Column(Text)
    risk_score = Column(Integer)
    opportunity_score = Column(Integer)

    created_at = Column(DateTime, default=datetime.utcnow)
    report_snapshot = Column(JSONB)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    product = relationship("Product", foreign_keys=[product_id])
