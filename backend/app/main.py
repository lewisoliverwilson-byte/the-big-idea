"""
The Big Idea — FastAPI backend
Deployed on AWS Lambda via Mangum adapter.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.api import auth, reports, products, billing, user

app = FastAPI(
    title="The Big Idea API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
ALLOWED_ORIGINS = [
    os.environ.get("FRONTEND_URL", "http://localhost:3000"),
    "https://*.amplifyapp.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(user.router, prefix="/api/v1")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "the-big-idea-api"}


# AWS Lambda handler
handler = Mangum(app, lifespan="off")
