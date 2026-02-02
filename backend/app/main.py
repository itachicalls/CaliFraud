"""
CaliFraud Intelligence API
FastAPI backend for fraud data visualization
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import cases, analytics, geo
from app.db.database import engine, Base, SessionLocal
from app.models.case import FraudCase


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Create database tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed if database is empty (quick seed for production)
    db = SessionLocal()
    try:
        count = db.query(FraudCase).count()
        if count == 0:
            print("Database empty - seeding with fraud data...")
            from app.db.seed_data import generate_cases, generate_mega_cases, Base as SeedBase
            from app.db.database import engine as db_engine
            
            # Quick seed: 5000 cases for faster startup
            SeedBase.metadata.create_all(bind=db_engine)
            
            cases = generate_mega_cases()  # ~18 mega cases
            cases.extend(generate_cases(5000))  # 5000 regular cases
            
            db.bulk_save_objects(cases)
            db.commit()
            print(f"Seeded {len(cases):,} cases!")
        else:
            print(f"Database has {count:,} cases - ready!")
    except Exception as e:
        print(f"Seed error (non-fatal): {e}")
    finally:
        db.close()
    
    yield  # App runs here
    
    # Shutdown
    print("Shutting down...")


app = FastAPI(
    title="CaliFraud Intelligence API",
    description="API for California fraud data visualization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow Vercel deployments and localhost
allowed_origins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://localhost:3003",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
]

# Add Vercel domains from environment
frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    allowed_origins.append(frontend_url)

# Allow all Vercel preview deployments
allowed_origins.extend([
    "https://cali-fraud.vercel.app",
    "https://califraud.vercel.app",
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel preview URLs
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
