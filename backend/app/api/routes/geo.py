"""
Geospatial API routes
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date

from app.db.database import get_db
from app.models.case import FraudCase

router = APIRouter()


# California county coordinates (centroids)
CA_COUNTIES = {
    "Alameda": {"lat": 37.6017, "lng": -121.7195},
    "Alpine": {"lat": 38.5966, "lng": -119.8208},
    "Amador": {"lat": 38.4466, "lng": -120.6538},
    "Butte": {"lat": 39.6670, "lng": -121.6008},
    "Calaveras": {"lat": 38.1964, "lng": -120.5544},
    "Colusa": {"lat": 39.1776, "lng": -122.2375},
    "Contra Costa": {"lat": 37.9195, "lng": -121.9290},
    "Del Norte": {"lat": 41.7433, "lng": -123.8963},
    "El Dorado": {"lat": 38.7786, "lng": -120.5246},
    "Fresno": {"lat": 36.9859, "lng": -119.2321},
    "Glenn": {"lat": 39.5984, "lng": -122.3917},
    "Humboldt": {"lat": 40.7450, "lng": -123.8695},
    "Imperial": {"lat": 33.0395, "lng": -115.3650},
    "Inyo": {"lat": 36.5108, "lng": -117.4109},
    "Kern": {"lat": 35.3430, "lng": -118.7296},
    "Kings": {"lat": 36.0753, "lng": -119.8155},
    "Lake": {"lat": 39.0996, "lng": -122.7531},
    "Lassen": {"lat": 40.6736, "lng": -120.5962},
    "Los Angeles": {"lat": 34.3083, "lng": -118.2280},
    "Madera": {"lat": 37.2182, "lng": -119.7627},
    "Marin": {"lat": 38.0834, "lng": -122.7633},
    "Mariposa": {"lat": 37.5848, "lng": -119.9663},
    "Mendocino": {"lat": 39.4380, "lng": -123.3918},
    "Merced": {"lat": 37.1948, "lng": -120.7178},
    "Modoc": {"lat": 41.5886, "lng": -120.7254},
    "Mono": {"lat": 37.9390, "lng": -118.8869},
    "Monterey": {"lat": 36.2400, "lng": -121.3103},
    "Napa": {"lat": 38.5025, "lng": -122.3655},
    "Nevada": {"lat": 39.3013, "lng": -120.7688},
    "Orange": {"lat": 33.7175, "lng": -117.8311},
    "Placer": {"lat": 39.0634, "lng": -120.7175},
    "Plumas": {"lat": 40.0035, "lng": -120.8388},
    "Riverside": {"lat": 33.7437, "lng": -115.9940},
    "Sacramento": {"lat": 38.4500, "lng": -121.3440},
    "San Benito": {"lat": 36.6058, "lng": -121.0750},
    "San Bernardino": {"lat": 34.8414, "lng": -116.1781},
    "San Diego": {"lat": 33.0289, "lng": -116.7694},
    "San Francisco": {"lat": 37.7562, "lng": -122.4430},
    "San Joaquin": {"lat": 37.9352, "lng": -121.2714},
    "San Luis Obispo": {"lat": 35.3869, "lng": -120.4357},
    "San Mateo": {"lat": 37.4337, "lng": -122.4014},
    "Santa Barbara": {"lat": 34.5375, "lng": -120.0388},
    "Santa Clara": {"lat": 37.2333, "lng": -121.6963},
    "Santa Cruz": {"lat": 37.0603, "lng": -122.0069},
    "Shasta": {"lat": 40.7637, "lng": -122.0407},
    "Sierra": {"lat": 39.5804, "lng": -120.5161},
    "Siskiyou": {"lat": 41.5926, "lng": -122.5405},
    "Solano": {"lat": 38.2665, "lng": -121.9404},
    "Sonoma": {"lat": 38.5254, "lng": -122.9278},
    "Stanislaus": {"lat": 37.5591, "lng": -120.9979},
    "Sutter": {"lat": 39.0346, "lng": -121.6950},
    "Tehama": {"lat": 40.1260, "lng": -122.2342},
    "Trinity": {"lat": 40.6506, "lng": -123.1130},
    "Tulare": {"lat": 36.2288, "lng": -118.7815},
    "Tuolumne": {"lat": 38.0282, "lng": -119.9546},
    "Ventura": {"lat": 34.3587, "lng": -119.1335},
    "Yolo": {"lat": 38.6866, "lng": -121.9016},
    "Yuba": {"lat": 39.2678, "lng": -121.3519},
}


@router.get("/counties")
async def get_counties():
    """Get California county boundaries (GeoJSON)"""
    # Return county centroids for heatmap positioning
    features = []
    for county, coords in CA_COUNTIES.items():
        features.append({
            "type": "Feature",
            "properties": {"name": county},
            "geometry": {
                "type": "Point",
                "coordinates": [coords["lng"], coords["lat"]],
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/points")
async def get_case_points(
    db: Session = Depends(get_db),
    scheme_type: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[float] = Query(None),
    max_amount: Optional[float] = Query(None),
):
    """Get fraud case points as GeoJSON for map markers"""
    query = db.query(FraudCase).filter(
        FraudCase.latitude.isnot(None),
        FraudCase.longitude.isnot(None),
    )

    filters = []
    if scheme_type:
        filters.append(FraudCase.scheme_type == scheme_type)
    if start_date:
        filters.append(FraudCase.date_filed >= start_date)
    if end_date:
        filters.append(FraudCase.date_filed <= end_date)
    if min_amount is not None:
        filters.append(FraudCase.amount_exposed >= min_amount)
    if max_amount is not None:
        filters.append(FraudCase.amount_exposed <= max_amount)

    if filters:
        query = query.filter(and_(*filters))

    cases = query.all()

    features = []
    for case in cases:
        features.append({
            "type": "Feature",
            "properties": {
                "id": case.id,
                "title": case.title,
                "scheme_type": case.scheme_type,
                "amount_exposed": float(case.amount_exposed) if case.amount_exposed else 0,
                "date_filed": case.date_filed.isoformat() if case.date_filed else None,
                "county": case.county,
                "status": case.status,
            },
            "geometry": {
                "type": "Point",
                "coordinates": [float(case.longitude), float(case.latitude)],
            },
        })

    return {
        "type": "FeatureCollection",
        "features": features,
    }


@router.get("/california-outline")
async def get_california_outline():
    """Get California state outline for the golden border effect"""
    # Simplified California outline coordinates
    return {
        "type": "Feature",
        "properties": {"name": "California"},
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [-124.409591, 42.009518],
                [-124.137573, 41.997065],
                [-124.211606, 41.147792],
                [-124.158132, 40.265358],
                [-124.065521, 39.692747],
                [-123.830961, 39.366758],
                [-123.765007, 38.953660],
                [-123.519868, 38.510883],
                [-123.055039, 37.971988],
                [-122.760529, 37.585571],
                [-122.415847, 37.241128],
                [-122.074287, 36.956083],
                [-121.879577, 36.631954],
                [-121.810726, 36.308446],
                [-121.586029, 36.237373],
                [-121.286542, 36.190338],
                [-120.869947, 35.977520],
                [-120.671997, 35.707225],
                [-120.623782, 35.223904],
                [-120.879947, 34.921875],
                [-121.026894, 34.643444],
                [-120.494766, 34.473673],
                [-120.003266, 34.461222],
                [-119.514481, 34.378571],
                [-119.138447, 34.104817],
                [-118.521499, 33.841377],
                [-118.132080, 33.752529],
                [-117.465576, 33.297520],
                [-117.134972, 32.876160],
                [-117.246704, 32.668203],
                [-117.009583, 32.534156],
                [-117.124862, 32.535330],
                [-117.241219, 32.665950],
                [-117.244492, 32.963265],
                [-116.074135, 32.624876],
                [-114.719550, 32.718763],
                [-114.524536, 32.755634],
                [-114.468750, 32.974014],
                [-114.522461, 33.032510],
                [-114.596863, 33.259277],
                [-114.635010, 33.426773],
                [-114.721069, 33.405933],
                [-114.677734, 33.549873],
                [-114.512451, 33.656723],
                [-114.495850, 33.770271],
                [-114.532349, 33.901329],
                [-114.492432, 34.113182],
                [-114.261230, 34.174118],
                [-114.139404, 34.303341],
                [-114.380371, 34.449570],
                [-114.632568, 34.877167],
                [-114.631348, 35.002083],
                [-114.595581, 35.123840],
                [-114.679565, 35.489841],
                [-114.655151, 35.869976],
                [-114.689453, 36.143310],
                [-114.371338, 36.140175],
                [-114.045410, 36.194122],
                [-114.044189, 37.592537],
                [-114.040283, 38.148781],
                [-114.043457, 38.676880],
                [-114.046875, 39.538750],
                [-114.050781, 40.116882],
                [-114.039551, 40.997952],
                [-114.039062, 41.995232],
                [-117.027588, 42.000183],
                [-119.312744, 41.989159],
                [-119.999084, 41.994476],
                [-122.378418, 42.009518],
                [-124.409591, 42.009518],
            ]],
        },
    }
