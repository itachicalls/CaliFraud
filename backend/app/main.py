"""
California Fraud Intelligence API
FastAPI backend for fraud data visualization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import cases, analytics, geo
from app.db.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="California Fraud Intelligence API",
    description="API for California healthcare fraud data visualization",
    version="1.0.0",
)

# CORS middleware for frontend (allow any localhost port for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cases.router, prefix="/api/cases", tags=["cases"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(geo.router, prefix="/api/geo", tags=["geo"])


@app.get("/")
async def root():
    return {
        "message": "California Fraud Intelligence API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
