"""
Analytics API routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from datetime import date

from app.db.database import get_db
from app.models.case import FraudCase

router = APIRouter()


@router.get("/summary")
async def get_summary(
    db: Session = Depends(get_db),
    scheme_type: Optional[str] = Query(None),
    county: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    """Get KPI summary statistics"""
    query = db.query(FraudCase)

    filters = []
    if scheme_type:
        filters.append(FraudCase.scheme_type == scheme_type)
    if county:
        filters.append(FraudCase.county == county)
    if start_date:
        filters.append(FraudCase.date_filed >= start_date)
    if end_date:
        filters.append(FraudCase.date_filed <= end_date)

    if filters:
        query = query.filter(and_(*filters))

    total_cases = query.count()
    total_exposed = query.with_entities(func.sum(FraudCase.amount_exposed)).scalar() or 0
    total_recovered = query.with_entities(func.sum(FraudCase.amount_recovered)).scalar() or 0
    avg_amount = query.with_entities(func.avg(FraudCase.amount_exposed)).scalar() or 0

    # Scheme type breakdown
    scheme_breakdown = (
        query.with_entities(FraudCase.scheme_type, func.count(), func.sum(FraudCase.amount_exposed))
        .group_by(FraudCase.scheme_type)
        .all()
    )

    return {
        "total_cases": total_cases,
        "total_exposed": float(total_exposed),
        "total_recovered": float(total_recovered),
        "average_amount": float(avg_amount),
        "recovery_rate": float(total_recovered) / float(total_exposed) * 100 if total_exposed > 0 else 0,
        "scheme_breakdown": [
            {"scheme_type": s[0], "count": s[1], "amount": float(s[2]) if s[2] else 0}
            for s in scheme_breakdown
            if s[0]
        ],
    }


@router.get("/heatmap")
async def get_heatmap_data(
    db: Session = Depends(get_db),
    scheme_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    """Get aggregated heatmap data by county"""
    query = db.query(
        FraudCase.county,
        func.count().label("case_count"),
        func.sum(FraudCase.amount_exposed).label("total_exposed"),
        func.avg(FraudCase.latitude).label("lat"),
        func.avg(FraudCase.longitude).label("lng"),
    )

    filters = []
    if scheme_type:
        filters.append(FraudCase.scheme_type == scheme_type)
    if start_date:
        filters.append(FraudCase.date_filed >= start_date)
    if end_date:
        filters.append(FraudCase.date_filed <= end_date)

    if filters:
        query = query.filter(and_(*filters))

    results = query.group_by(FraudCase.county).all()

    return [
        {
            "county": r[0],
            "case_count": r[1],
            "total_exposed": float(r[2]) if r[2] else 0,
            "latitude": float(r[3]) if r[3] else None,
            "longitude": float(r[4]) if r[4] else None,
        }
        for r in results
        if r[0]
    ]


@router.get("/timeline")
async def get_timeline_data(
    db: Session = Depends(get_db),
    scheme_type: Optional[str] = Query(None),
    county: Optional[str] = Query(None),
    granularity: str = Query("month", regex="^(day|week|month|quarter|year)$"),
):
    """Get time-series data for animated replay"""
    query = db.query(
        extract("year", FraudCase.date_filed).label("year"),
        extract("month", FraudCase.date_filed).label("month"),
        func.count().label("case_count"),
        func.sum(FraudCase.amount_exposed).label("total_exposed"),
    )

    filters = [FraudCase.date_filed.isnot(None)]
    if scheme_type:
        filters.append(FraudCase.scheme_type == scheme_type)
    if county:
        filters.append(FraudCase.county == county)

    query = query.filter(and_(*filters))

    results = (
        query.group_by(
            extract("year", FraudCase.date_filed),
            extract("month", FraudCase.date_filed),
        )
        .order_by(
            extract("year", FraudCase.date_filed),
            extract("month", FraudCase.date_filed),
        )
        .all()
    )

    return [
        {
            "year": int(r[0]),
            "month": int(r[1]),
            "period": f"{int(r[0])}-{int(r[1]):02d}",
            "case_count": r[2],
            "total_exposed": float(r[3]) if r[3] else 0,
        }
        for r in results
    ]
