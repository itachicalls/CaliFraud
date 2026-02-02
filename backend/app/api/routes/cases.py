"""
Fraud Cases API routes
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import date

from app.db.database import get_db
from app.models.case import FraudCase

router = APIRouter()


@router.get("")
async def get_cases(
    db: Session = Depends(get_db),
    scheme_type: Optional[str] = Query(None, description="Filter by scheme type"),
    county: Optional[str] = Query(None, description="Filter by county"),
    min_amount: Optional[float] = Query(None, description="Minimum fraud amount"),
    max_amount: Optional[float] = Query(None, description="Maximum fraud amount"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    status: Optional[str] = Query(None, description="Case status filter"),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
):
    """Get fraud cases with optional filters"""
    query = db.query(FraudCase)

    filters = []
    if scheme_type:
        filters.append(FraudCase.scheme_type == scheme_type)
    if county:
        filters.append(FraudCase.county == county)
    if min_amount is not None:
        filters.append(FraudCase.amount_exposed >= min_amount)
    if max_amount is not None:
        filters.append(FraudCase.amount_exposed <= max_amount)
    if start_date:
        filters.append(FraudCase.date_filed >= start_date)
    if end_date:
        filters.append(FraudCase.date_filed <= end_date)
    if status:
        filters.append(FraudCase.status == status)

    if filters:
        query = query.filter(and_(*filters))

    total = query.count()
    cases = query.order_by(FraudCase.date_filed.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "cases": [case.to_dict() for case in cases],
        "limit": limit,
        "offset": offset,
    }


@router.get("/{case_id}")
async def get_case(case_id: int, db: Session = Depends(get_db)):
    """Get a single fraud case by ID"""
    case = db.query(FraudCase).filter(FraudCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case.to_dict()


@router.get("/scheme-types/list")
async def get_scheme_types(db: Session = Depends(get_db)):
    """Get list of all scheme types"""
    types = db.query(FraudCase.scheme_type).distinct().all()
    return [t[0] for t in types if t[0]]


@router.get("/counties/list")
async def get_counties(db: Session = Depends(get_db)):
    """Get list of all counties with cases"""
    counties = db.query(FraudCase.county).distinct().all()
    return [c[0] for c in counties if c[0]]
