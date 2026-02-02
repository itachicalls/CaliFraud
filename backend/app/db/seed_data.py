"""
CALIFORNIA FRAUD DATABASE - COMPREHENSIVE SEED DATA
Reflecting the full scale of fraud exposed across all programs
"""

import random
from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import SessionLocal, engine, Base
from app.models.case import FraudCase

# All 58 California counties with coordinates and fraud weighting
COUNTIES = {
    # Major metros - highest fraud concentration
    "Los Angeles": {"lat": 34.0522, "lng": -118.2437, "weight": 28, "pop": 10000000},
    "San Diego": {"lat": 32.7157, "lng": -117.1611, "weight": 10, "pop": 3300000},
    "Orange": {"lat": 33.7175, "lng": -117.8311, "weight": 9, "pop": 3200000},
    "Riverside": {"lat": 33.9806, "lng": -117.3755, "weight": 7, "pop": 2500000},
    "San Bernardino": {"lat": 34.1083, "lng": -117.2898, "weight": 7, "pop": 2200000},
    "Santa Clara": {"lat": 37.3541, "lng": -121.9552, "weight": 5, "pop": 1900000},
    "Alameda": {"lat": 37.8044, "lng": -122.2712, "weight": 5, "pop": 1700000},
    "Sacramento": {"lat": 38.5816, "lng": -121.4944, "weight": 5, "pop": 1550000},
    "San Francisco": {"lat": 37.7749, "lng": -122.4194, "weight": 4, "pop": 870000},
    "Contra Costa": {"lat": 37.9161, "lng": -122.0574, "weight": 3, "pop": 1150000},
    "Fresno": {"lat": 36.7378, "lng": -119.7871, "weight": 3, "pop": 1000000},
    "Kern": {"lat": 35.3733, "lng": -119.0187, "weight": 3, "pop": 900000},
    "San Mateo": {"lat": 37.5585, "lng": -122.2711, "weight": 2, "pop": 770000},
    "Ventura": {"lat": 34.2746, "lng": -119.2290, "weight": 2, "pop": 850000},
    "San Joaquin": {"lat": 37.9577, "lng": -121.2908, "weight": 2, "pop": 780000},
    "Stanislaus": {"lat": 37.5091, "lng": -120.9876, "weight": 2, "pop": 550000},
    "Sonoma": {"lat": 38.2921, "lng": -122.4580, "weight": 1, "pop": 490000},
    "Tulare": {"lat": 36.2077, "lng": -119.3473, "weight": 2, "pop": 470000},
    "Santa Barbara": {"lat": 34.4208, "lng": -119.6982, "weight": 1, "pop": 450000},
    "Monterey": {"lat": 36.6002, "lng": -121.8947, "weight": 1, "pop": 440000},
    "Placer": {"lat": 38.7849, "lng": -121.2357, "weight": 1, "pop": 410000},
    "Solano": {"lat": 38.2494, "lng": -121.7853, "weight": 1, "pop": 450000},
    "Marin": {"lat": 37.9735, "lng": -122.5311, "weight": 1, "pop": 260000},
    "Santa Cruz": {"lat": 36.9741, "lng": -122.0308, "weight": 1, "pop": 270000},
    "Merced": {"lat": 37.3022, "lng": -120.4830, "weight": 1, "pop": 290000},
    "Butte": {"lat": 39.7284, "lng": -121.8375, "weight": 1, "pop": 220000},
    "Yolo": {"lat": 38.6866, "lng": -121.8261, "weight": 1, "pop": 220000},
    "El Dorado": {"lat": 38.7790, "lng": -120.5243, "weight": 1, "pop": 190000},
    "Shasta": {"lat": 40.5865, "lng": -122.3917, "weight": 1, "pop": 180000},
    "Imperial": {"lat": 32.8476, "lng": -115.5695, "weight": 2, "pop": 180000},
    "Kings": {"lat": 36.0753, "lng": -119.8155, "weight": 1, "pop": 150000},
    "Madera": {"lat": 37.2519, "lng": -119.7627, "weight": 1, "pop": 160000},
    "Napa": {"lat": 38.2975, "lng": -122.2855, "weight": 1, "pop": 140000},
    "Humboldt": {"lat": 40.7450, "lng": -123.8695, "weight": 1, "pop": 135000},
    "Nevada": {"lat": 39.2616, "lng": -121.0160, "weight": 1, "pop": 100000},
    "Sutter": {"lat": 39.0346, "lng": -121.6947, "weight": 1, "pop": 100000},
    "Mendocino": {"lat": 39.4457, "lng": -123.3915, "weight": 1, "pop": 90000},
    "Yuba": {"lat": 39.2678, "lng": -121.3519, "weight": 1, "pop": 80000},
    "Lake": {"lat": 39.0840, "lng": -122.8084, "weight": 1, "pop": 68000},
    "Tehama": {"lat": 40.1260, "lng": -122.2342, "weight": 1, "pop": 65000},
    "San Luis Obispo": {"lat": 35.2828, "lng": -120.6596, "weight": 1, "pop": 280000},
    "San Benito": {"lat": 36.6063, "lng": -121.0850, "weight": 1, "pop": 65000},
    "Tuolumne": {"lat": 38.0282, "lng": -119.9546, "weight": 1, "pop": 55000},
    "Calaveras": {"lat": 38.1877, "lng": -120.5561, "weight": 1, "pop": 45000},
    "Siskiyou": {"lat": 41.5926, "lng": -122.5400, "weight": 1, "pop": 45000},
    "Amador": {"lat": 38.4494, "lng": -120.6539, "weight": 1, "pop": 40000},
    "Lassen": {"lat": 40.6739, "lng": -120.5917, "weight": 1, "pop": 32000},
    "Glenn": {"lat": 39.5983, "lng": -122.3928, "weight": 1, "pop": 28000},
    "Del Norte": {"lat": 41.7459, "lng": -124.0860, "weight": 1, "pop": 28000},
    "Colusa": {"lat": 39.1776, "lng": -122.2372, "weight": 1, "pop": 22000},
    "Plumas": {"lat": 39.9619, "lng": -120.8379, "weight": 1, "pop": 20000},
    "Inyo": {"lat": 36.4897, "lng": -117.9807, "weight": 1, "pop": 19000},
    "Mariposa": {"lat": 37.4836, "lng": -119.9665, "weight": 1, "pop": 18000},
    "Mono": {"lat": 37.9389, "lng": -118.9500, "weight": 1, "pop": 14000},
    "Trinity": {"lat": 40.6506, "lng": -123.1130, "weight": 1, "pop": 13000},
    "Modoc": {"lat": 41.5890, "lng": -120.7253, "weight": 1, "pop": 9000},
    "Sierra": {"lat": 39.5802, "lng": -120.5160, "weight": 1, "pop": 3200},
    "Alpine": {"lat": 38.5941, "lng": -119.8206, "weight": 1, "pop": 1200},
}

# COMPREHENSIVE FRAUD SCHEMES - Reflecting real California fraud landscape
SCHEME_TYPES = [
    # EDD/Unemployment Fraud - The $31B+ scandal
    {"type": "edd_unemployment", "weight": 22, "min_amount": 10000, "max_amount": 25000000,
     "description": "EDD unemployment benefits fraud", "peak_years": [2020, 2021, 2022]},
    
    # COVID Relief Fraud - PPP, EIDL
    {"type": "ppp_fraud", "weight": 15, "min_amount": 50000, "max_amount": 20000000,
     "description": "PPP loan fraud", "peak_years": [2020, 2021, 2022]},
    {"type": "eidl_fraud", "weight": 8, "min_amount": 25000, "max_amount": 10000000,
     "description": "EIDL loan fraud", "peak_years": [2020, 2021, 2022]},
    
    # Medi-Cal/Healthcare Fraud
    {"type": "medi_cal", "weight": 12, "min_amount": 100000, "max_amount": 50000000,
     "description": "Medi-Cal billing fraud", "peak_years": [2023, 2024, 2025, 2026]},
    {"type": "telemedicine", "weight": 8, "min_amount": 100000, "max_amount": 40000000,
     "description": "Telemedicine billing fraud", "peak_years": [2020, 2021, 2022]},
    {"type": "pharmacy", "weight": 6, "min_amount": 50000, "max_amount": 30000000,
     "description": "Pharmacy fraud/pill mills", "peak_years": None},
    {"type": "dme", "weight": 5, "min_amount": 75000, "max_amount": 25000000,
     "description": "Durable medical equipment fraud", "peak_years": None},
    {"type": "home_health", "weight": 4, "min_amount": 100000, "max_amount": 35000000,
     "description": "Home health care fraud", "peak_years": None},
    {"type": "hospice", "weight": 2, "min_amount": 200000, "max_amount": 45000000,
     "description": "Hospice care fraud", "peak_years": [2024, 2025, 2026]},
    
    # Homelessness/Housing Program Fraud - Major recent controversy
    {"type": "homeless_program", "weight": 10, "min_amount": 100000, "max_amount": 75000000,
     "description": "Homeless program/housing fraud", "peak_years": [2024, 2025, 2026]},
    
    # CalFresh/SNAP Fraud
    {"type": "calfresh", "weight": 5, "min_amount": 5000, "max_amount": 5000000,
     "description": "CalFresh/SNAP benefits fraud", "peak_years": None},
    
    # Workers Compensation Fraud
    {"type": "workers_comp", "weight": 4, "min_amount": 50000, "max_amount": 15000000,
     "description": "Workers compensation fraud", "peak_years": None},
    
    # Government Contract Fraud
    {"type": "contract_fraud", "weight": 5, "min_amount": 500000, "max_amount": 100000000,
     "description": "Government contract fraud", "peak_years": [2024, 2025, 2026]},
    
    # Tax Fraud
    {"type": "tax_fraud", "weight": 4, "min_amount": 100000, "max_amount": 50000000,
     "description": "Tax evasion/fraud", "peak_years": None},
    
    # Insurance Fraud
    {"type": "insurance_fraud", "weight": 4, "min_amount": 25000, "max_amount": 20000000,
     "description": "Insurance fraud", "peak_years": None},
    
    # Education/School Fraud
    {"type": "education_fraud", "weight": 2, "min_amount": 100000, "max_amount": 30000000,
     "description": "Education funding fraud", "peak_years": [2024, 2025, 2026]},
    
    # Substance Abuse Treatment Fraud
    {"type": "substance_abuse", "weight": 3, "min_amount": 500000, "max_amount": 80000000,
     "description": "Substance abuse treatment fraud", "peak_years": [2023, 2024, 2025]},
    
    # Lab Testing Fraud
    {"type": "lab_testing", "weight": 3, "min_amount": 200000, "max_amount": 60000000,
     "description": "Laboratory testing fraud", "peak_years": [2020, 2021, 2022]},
]

# Title templates for each scheme type
TITLE_TEMPLATES = {
    "edd_unemployment": [
        "EDD Fraud Ring - {city}",
        "Unemployment Benefits Fraud - {county} County",
        "Pandemic Unemployment Assistance Scam - {city}",
        "Multi-Million Dollar EDD Scheme - {city}",
        "Identity Theft EDD Fraud - {county}",
        "Organized EDD Benefits Theft - {city}",
        "Fraudulent Unemployment Claims - {county} County",
        "EDD Prisoner Fraud Scheme - {city}",
    ],
    "ppp_fraud": [
        "PPP Loan Fraud - {city} Business",
        "Paycheck Protection Program Scheme - {county}",
        "COVID Relief Fund Fraud - {city}",
        "Fraudulent PPP Application - {county} County",
        "PPP Kickback Conspiracy - {city}",
        "Shell Company PPP Fraud - {city}",
    ],
    "eidl_fraud": [
        "EIDL Loan Fraud - {city}",
        "Economic Injury Disaster Loan Scheme - {county}",
        "SBA EIDL Fraud - {city}",
        "COVID EIDL Misuse - {county} County",
    ],
    "medi_cal": [
        "Medi-Cal Billing Fraud - {city}",
        "Phantom Patient Billing - {county} County",
        "Medi-Cal Overbilling Scheme - {city}",
        "Fraudulent Medi-Cal Claims - {county}",
        "Medi-Cal Kickback Conspiracy - {city}",
        "Upcoding Medi-Cal Services - {county} County",
    ],
    "telemedicine": [
        "Telemedicine Fraud Scheme - {city}",
        "COVID Telehealth Billing Fraud - {city}",
        "Remote Consultation Fraud - {county} County",
        "Virtual Visit Upcoding - {city}",
        "Telemedicine Kickback Ring - {county}",
    ],
    "pharmacy": [
        "Pharmacy Kickback Scheme - {city}",
        "Prescription Drug Diversion - {county}",
        "Compounding Pharmacy Fraud - {city}",
        "Controlled Substance Mill - {county} County",
        "Pharmacy Billing Fraud - {city}",
    ],
    "dme": [
        "DME Fraud Scheme - {city}",
        "Wheelchair Billing Fraud - {county}",
        "Medical Equipment Kickbacks - {city}",
        "Orthotic Device Scheme - {county} County",
    ],
    "home_health": [
        "Home Health Care Fraud - {city}",
        "Phantom Patient Scheme - {county}",
        "Home Nursing Kickback - {city}",
        "Unlicensed Care Provider - {county} County",
    ],
    "hospice": [
        "Hospice Fraud - {city}",
        "Ineligible Hospice Enrollment - {county}",
        "Hospice Billing Scheme - {city}",
        "End-of-Life Care Fraud - {county} County",
    ],
    "homeless_program": [
        "Homeless Program Fraud - {city}",
        "Housing First Program Abuse - {county}",
        "Homeless Services Embezzlement - {city}",
        "Transitional Housing Fraud - {county} County",
        "Shelter Funding Misuse - {city}",
        "Homeless Grant Fraud - {county}",
        "Project Homekey Fraud - {city}",
        "LAHSA Contract Fraud - {county} County",
    ],
    "calfresh": [
        "CalFresh Benefits Trafficking - {city}",
        "SNAP Fraud Ring - {county}",
        "EBT Card Scheme - {city}",
        "Food Stamp Fraud - {county} County",
    ],
    "workers_comp": [
        "Workers Comp Fraud - {city}",
        "Fraudulent Injury Claims - {county}",
        "Premium Fraud Scheme - {city}",
        "Workers Comp Mill - {county} County",
    ],
    "contract_fraud": [
        "Government Contract Fraud - {city}",
        "No-Bid Contract Scheme - {county}",
        "Public Works Fraud - {city}",
        "State Contract Kickbacks - {county} County",
        "Municipal Contract Fraud - {city}",
        "Infrastructure Fraud - {county}",
    ],
    "tax_fraud": [
        "Tax Evasion Scheme - {city}",
        "Payroll Tax Fraud - {county}",
        "Sales Tax Scheme - {city}",
        "Income Tax Fraud - {county} County",
    ],
    "insurance_fraud": [
        "Auto Insurance Fraud Ring - {city}",
        "Staged Accident Scheme - {county}",
        "Property Insurance Fraud - {city}",
        "Health Insurance Fraud - {county} County",
    ],
    "education_fraud": [
        "School Funding Fraud - {city}",
        "Education Grant Embezzlement - {county}",
        "Charter School Fraud - {city}",
        "Student Loan Scheme - {county} County",
        "Title I Funding Fraud - {city}",
    ],
    "substance_abuse": [
        "Treatment Center Fraud - {city}",
        "Sober Living Kickbacks - {county}",
        "Addiction Center Billing Fraud - {city}",
        "Patient Brokering Ring - {county} County",
        "Rehab Insurance Fraud - {city}",
    ],
    "lab_testing": [
        "Lab Testing Fraud - {city}",
        "COVID Testing Scheme - {county}",
        "Genetic Testing Kickbacks - {city}",
        "Unnecessary Lab Orders - {county} County",
    ],
}

# Cities by county
CITIES = {
    "Los Angeles": ["Los Angeles", "Long Beach", "Glendale", "Santa Monica", "Pasadena", 
                   "Burbank", "Torrance", "Inglewood", "Downey", "West Covina", "Norwalk",
                   "El Monte", "Carson", "Compton", "South Gate", "Lancaster", "Palmdale",
                   "Pomona", "Hawthorne", "Lakewood", "Bellflower", "Baldwin Park", "Lynwood"],
    "San Diego": ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", 
                  "El Cajon", "Vista", "San Marcos", "Encinitas", "National City"],
    "Orange": ["Anaheim", "Santa Ana", "Irvine", "Huntington Beach", "Garden Grove", 
               "Fullerton", "Costa Mesa", "Orange", "Mission Viejo", "Westminster", "Buena Park"],
    "Riverside": ["Riverside", "Corona", "Moreno Valley", "Temecula", "Murrieta", 
                  "Palm Springs", "Hemet", "Menifee", "Indio", "Palm Desert"],
    "San Bernardino": ["San Bernardino", "Fontana", "Rancho Cucamonga", "Ontario", 
                       "Victorville", "Rialto", "Hesperia", "Chino", "Upland", "Apple Valley"],
    "Santa Clara": ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View", "Palo Alto", 
                    "Milpitas", "Cupertino", "Campbell", "Gilroy", "Morgan Hill"],
    "Alameda": ["Oakland", "Fremont", "Hayward", "Berkeley", "San Leandro", "Alameda",
                "Livermore", "Pleasanton", "Union City", "Newark"],
    "Sacramento": ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights",
                   "Rancho Cordova", "Arden-Arcade", "Carmichael"],
    "San Francisco": ["San Francisco"],
    "Contra Costa": ["Concord", "Richmond", "Antioch", "Walnut Creek", "San Ramon",
                     "Pittsburg", "Brentwood", "Danville"],
    "Fresno": ["Fresno", "Clovis", "Sanger", "Selma"],
    "Kern": ["Bakersfield", "Delano", "Ridgecrest", "Tehachapi"],
    "San Mateo": ["Daly City", "San Mateo", "Redwood City", "South San Francisco",
                  "San Bruno", "Foster City", "Burlingame"],
    "Ventura": ["Oxnard", "Thousand Oaks", "Ventura", "Simi Valley", "Camarillo", "Moorpark"],
    "San Joaquin": ["Stockton", "Tracy", "Manteca", "Lodi", "Modesto"],
    "Stanislaus": ["Modesto", "Turlock", "Ceres", "Patterson"],
    "Sonoma": ["Santa Rosa", "Petaluma", "Rohnert Park", "Windsor"],
    "Tulare": ["Visalia", "Tulare", "Porterville", "Hanford"],
    "Santa Barbara": ["Santa Barbara", "Santa Maria", "Lompoc", "Goleta"],
    "Monterey": ["Salinas", "Monterey", "Seaside", "Marina"],
    "Placer": ["Roseville", "Rocklin", "Lincoln", "Auburn"],
    "Solano": ["Vallejo", "Fairfield", "Vacaville", "Benicia"],
    "Marin": ["San Rafael", "Novato", "Mill Valley", "Corte Madera"],
    "Santa Cruz": ["Santa Cruz", "Watsonville", "Capitola"],
    "Merced": ["Merced", "Los Banos", "Atwater"],
    "San Luis Obispo": ["San Luis Obispo", "Paso Robles", "Atascadero"],
    "Imperial": ["El Centro", "Calexico", "Brawley"],
}

STATUSES = ["open", "under_investigation", "charged", "settled", "convicted", "dismissed"]
STATUS_WEIGHTS = [20, 25, 15, 20, 15, 5]

# Perpetrator types
PERPETRATOR_TYPES = [
    "Individual", "Criminal Ring", "Business Entity", "Healthcare Provider",
    "Government Employee", "Organized Crime", "Identity Theft Ring"
]


def weighted_choice(items, weight_key="weight"):
    """Select item based on weights"""
    total = sum(item[weight_key] if isinstance(item, dict) else item[1] for item in items)
    r = random.uniform(0, total)
    cumulative = 0
    for item in items:
        weight = item[weight_key] if isinstance(item, dict) else item[1]
        cumulative += weight
        if r <= cumulative:
            return item
    return items[-1]


def generate_date_weighted(start_date, end_date, peak_years=None):
    """Generate date with optional weighting toward peak years"""
    if peak_years and random.random() < 0.7:
        year = random.choice(peak_years)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        try:
            return date(year, month, day)
        except:
            return date(year, month, 1)
    
    # Weight toward more recent dates (2024-2026)
    if random.random() < 0.5:
        year = random.choices([2024, 2025, 2026], weights=[30, 40, 30])[0]
        if year == 2026:
            month = random.randint(1, 2)
            day = random.randint(1, 2 if month == 2 else 31)
        else:
            month = random.randint(1, 12)
            day = random.randint(1, 28)
        return date(year, month, day)
    
    date_range = (end_date - start_date).days
    days_offset = random.randint(0, date_range)
    return start_date + timedelta(days=days_offset)


def generate_mega_cases():
    """Generate notable large-scale fraud cases that made headlines"""
    mega_cases = [
        # EDD Mega Cases
        {
            "title": "EDD Pandemic Fraud - Multi-State Criminal Enterprise",
            "scheme_type": "edd_unemployment",
            "amount": 250000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2021, 3, 15),
            "status": "convicted",
        },
        {
            "title": "California Prison EDD Fraud Ring",
            "scheme_type": "edd_unemployment", 
            "amount": 140000000,
            "county": "Sacramento",
            "city": "Sacramento",
            "date": date(2021, 1, 20),
            "status": "convicted",
        },
        {
            "title": "Romanian Crime Ring EDD Scheme",
            "scheme_type": "edd_unemployment",
            "amount": 85000000,
            "county": "Orange",
            "city": "Irvine",
            "date": date(2021, 6, 10),
            "status": "convicted",
        },
        {
            "title": "Death Row Inmates EDD Claims Fraud",
            "scheme_type": "edd_unemployment",
            "amount": 35000000,
            "county": "San Quentin",
            "city": "San Quentin",
            "date": date(2020, 11, 5),
            "status": "under_investigation",
        },
        # Homeless Program Mega Fraud
        {
            "title": "LA Homeless Housing Authority Embezzlement",
            "scheme_type": "homeless_program",
            "amount": 95000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2025, 8, 12),
            "status": "under_investigation",
        },
        {
            "title": "Project Homekey Contractor Fraud Network",
            "scheme_type": "homeless_program",
            "amount": 67000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2025, 11, 3),
            "status": "charged",
        },
        {
            "title": "SF Navigation Center Billing Fraud",
            "scheme_type": "homeless_program",
            "amount": 42000000,
            "county": "San Francisco",
            "city": "San Francisco",
            "date": date(2025, 6, 22),
            "status": "under_investigation",
        },
        {
            "title": "Bay Area Homeless Services Corruption",
            "scheme_type": "homeless_program",
            "amount": 38000000,
            "county": "Alameda",
            "city": "Oakland",
            "date": date(2026, 1, 8),
            "status": "charged",
        },
        # 2026 Major Exposé Cases (Recent Controversy)
        {
            "title": "Statewide Homeless Fund Embezzlement Network",
            "scheme_type": "homeless_program",
            "amount": 125000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2026, 1, 15),
            "status": "under_investigation",
        },
        {
            "title": "CalAIM Healthcare Transition Fraud Ring",
            "scheme_type": "medi_cal",
            "amount": 78000000,
            "county": "San Diego",
            "city": "San Diego",
            "date": date(2026, 1, 22),
            "status": "charged",
        },
        {
            "title": "Central Valley Medi-Cal Billing Conspiracy",
            "scheme_type": "medi_cal",
            "amount": 56000000,
            "county": "Fresno",
            "city": "Fresno",
            "date": date(2025, 12, 5),
            "status": "under_investigation",
        },
        # PPP Mega Cases
        {
            "title": "LA Tech Company PPP Fraud Network",
            "scheme_type": "ppp_fraud",
            "amount": 45000000,
            "county": "Los Angeles",
            "city": "Santa Monica",
            "date": date(2021, 8, 15),
            "status": "convicted",
        },
        {
            "title": "Bay Area PPP Loan Mill Operation",
            "scheme_type": "ppp_fraud",
            "amount": 38000000,
            "county": "Santa Clara",
            "city": "San Jose",
            "date": date(2022, 3, 20),
            "status": "settled",
        },
        # Healthcare Mega Cases
        {
            "title": "Southern California Telemedicine Fraud Empire",
            "scheme_type": "telemedicine",
            "amount": 180000000,
            "county": "Orange",
            "city": "Anaheim",
            "date": date(2021, 5, 8),
            "status": "convicted",
        },
        {
            "title": "Inland Empire Hospice Fraud Ring",
            "scheme_type": "hospice",
            "amount": 95000000,
            "county": "Riverside",
            "city": "Riverside",
            "date": date(2025, 4, 18),
            "status": "charged",
        },
        {
            "title": "LA Sober Living Patient Brokering Network",
            "scheme_type": "substance_abuse",
            "amount": 175000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2024, 7, 12),
            "status": "convicted",
        },
        # Contract Fraud
        {
            "title": "California High-Speed Rail Contract Fraud",
            "scheme_type": "contract_fraud",
            "amount": 220000000,
            "county": "Sacramento",
            "city": "Sacramento",
            "date": date(2025, 9, 30),
            "status": "under_investigation",
        },
        {
            "title": "LA Metro Contractor Kickback Scheme",
            "scheme_type": "contract_fraud",
            "amount": 85000000,
            "county": "Los Angeles",
            "city": "Los Angeles",
            "date": date(2025, 5, 14),
            "status": "charged",
        },
    ]
    
    cases = []
    for mc in mega_cases:
        county_data = COUNTIES.get(mc["county"], COUNTIES["Los Angeles"])
        lat = county_data["lat"] + random.uniform(-0.05, 0.05)
        lng = county_data["lng"] + random.uniform(-0.05, 0.05)
        
        resolved_date = None
        if mc["status"] in ["settled", "convicted"]:
            resolved_date = mc["date"] + timedelta(days=random.randint(180, 540))
            if resolved_date > date.today():
                resolved_date = date.today() - timedelta(days=random.randint(30, 90))
        
        case = FraudCase(
            case_number=f"CA-MEGA-{mc['date'].year}-{len(cases)+1:04d}",
            title=mc["title"],
            description=f"Major fraud investigation: {mc['title']}. "
                       f"Alleged fraudulent activity totaling ${mc['amount']:,.0f}. "
                       f"This case represents one of the largest fraud schemes in California history.",
            scheme_type=mc["scheme_type"],
            amount_exposed=Decimal(mc["amount"]),
            amount_recovered=Decimal(mc["amount"] * random.uniform(0.1, 0.5)) if mc["status"] in ["settled", "convicted"] else Decimal(0),
            date_filed=mc["date"],
            date_resolved=resolved_date,
            status=mc["status"],
            county=mc["county"],
            city=mc["city"],
            latitude=Decimal(str(lat)),
            longitude=Decimal(str(lng)),
            source_url=f"https://oig.hhs.gov/fraud/enforcement/{mc['date'].year}/mega-{len(cases)+1:04d}",
        )
        cases.append(case)
    
    return cases


def generate_cases(count: int = 50000):
    """Generate comprehensive fraud cases across all of California"""
    cases = []
    start_date = date(2020, 1, 1)
    end_date = date(2026, 2, 2)
    
    county_items = [(name, data["weight"]) for name, data in COUNTIES.items()]
    
    for i in range(count):
        # Select county weighted by fraud activity
        county_name, _ = weighted_choice(county_items, weight_key=1)
        county_data = COUNTIES[county_name]
        
        # Select scheme type
        scheme = weighted_choice(SCHEME_TYPES)
        
        # Select city
        city_list = CITIES.get(county_name, [county_name])
        city = random.choice(city_list) if city_list else county_name
        
        # Generate amounts with occasional mega amounts
        if random.random() < 0.02:  # 2% chance of large case
            amount_exposed = Decimal(random.uniform(scheme["max_amount"] * 0.5, scheme["max_amount"] * 2))
        else:
            amount_exposed = Decimal(random.uniform(scheme["min_amount"], scheme["max_amount"]))
        
        recovery_rate = random.uniform(0.05, 0.65)
        amount_recovered = amount_exposed * Decimal(recovery_rate) if random.random() > 0.4 else Decimal(0)
        
        # Generate date with weighting
        filed_date = generate_date_weighted(start_date, end_date, scheme.get("peak_years"))
        
        # Status based on age of case
        days_old = (date.today() - filed_date).days
        if days_old < 90:
            status = random.choices(["open", "under_investigation"], weights=[60, 40])[0]
        elif days_old < 365:
            status = random.choices(STATUSES, weights=[15, 35, 20, 15, 10, 5])[0]
        else:
            status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]
        
        # Resolution date for closed cases
        resolved_date = None
        if status in ["settled", "convicted", "dismissed"]:
            resolve_days = random.randint(90, 730)
            resolved_date = filed_date + timedelta(days=resolve_days)
            if resolved_date > date.today():
                resolved_date = None
                status = random.choice(["open", "under_investigation", "charged"])
        
        # Generate coordinates with random offset for visual spread
        lat = county_data["lat"] + random.uniform(-0.2, 0.2)
        lng = county_data["lng"] + random.uniform(-0.2, 0.2)
        
        # Generate title
        templates = TITLE_TEMPLATES.get(scheme["type"], [f"{scheme['type']} Fraud - {{city}}"])
        title_template = random.choice(templates)
        title = title_template.format(city=city, county=county_name)
        
        perpetrator = random.choice(PERPETRATOR_TYPES)
        
        case = FraudCase(
            case_number=f"CA-{filed_date.year}-{i+1:06d}",
            title=title,
            description=f"{scheme['description'].title()} investigation in {city}, {county_name} County. "
                       f"Perpetrator type: {perpetrator}. "
                       f"Alleged fraudulent activity totaling ${amount_exposed:,.0f}.",
            scheme_type=scheme["type"],
            amount_exposed=amount_exposed,
            amount_recovered=amount_recovered,
            date_filed=filed_date,
            date_resolved=resolved_date,
            status=status,
            county=county_name,
            city=city,
            latitude=Decimal(str(lat)),
            longitude=Decimal(str(lng)),
            source_url=f"https://oig.ca.gov/fraud/{filed_date.year}/{i+1:06d}",
        )
        cases.append(case)
        
        if (i + 1) % 10000 == 0:
            print(f"  Generated {i + 1:,} cases...")
    
    return cases


def seed_database(force_reseed=False):
    """Seed the database with comprehensive fraud cases"""
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        existing = db.query(FraudCase).count()
        if existing > 0 and not force_reseed:
            print(f"Database already has {existing:,} cases. Use force_reseed=True to replace.")
            return
        
        if existing > 0:
            print(f"Clearing existing {existing:,} cases...")
            db.query(FraudCase).delete()
            db.commit()
        
        print("=" * 60)
        print("CALIFORNIA FRAUD DATABASE - COMPREHENSIVE SEED")
        print("=" * 60)
        
        # Generate mega cases first
        print("\nGenerating headline mega-fraud cases...")
        mega_cases = generate_mega_cases()
        print(f"  Created {len(mega_cases)} mega cases")
        
        # Generate regular cases
        print("\nGenerating comprehensive fraud dataset...")
        regular_cases = generate_cases(50000)
        print(f"  Created {len(regular_cases):,} regular cases")
        
        all_cases = mega_cases + regular_cases
        
        print(f"\nInserting {len(all_cases):,} total cases...")
        
        # Batch insert for performance
        batch_size = 5000
        for i in range(0, len(all_cases), batch_size):
            batch = all_cases[i:i + batch_size]
            db.bulk_save_objects(batch)
            db.commit()
            print(f"  Inserted batch {i // batch_size + 1}/{(len(all_cases) + batch_size - 1) // batch_size}")
        
        print("\n" + "=" * 60)
        print("SEED COMPLETE!")
        print("=" * 60)
        
        # Print summary statistics
        total = db.query(FraudCase).count()
        total_exposed = db.query(func.sum(FraudCase.amount_exposed)).scalar() or 0
        total_recovered = db.query(func.sum(FraudCase.amount_recovered)).scalar() or 0
        
        print(f"\nTotal cases: {total:,}")
        print(f"Total fraud exposed: ${total_exposed:,.0f}")
        print(f"Total recovered: ${total_recovered:,.0f}")
        
        # Cases by year
        print("\nCases by year:")
        for year in range(2020, 2027):
            count = db.query(FraudCase).filter(
                FraudCase.date_filed >= date(year, 1, 1),
                FraudCase.date_filed < date(year + 1 if year < 2026 else year, 1 if year < 2026 else 12, 1 if year < 2026 else 31)
            ).count()
            print(f"  {year}: {count:,} cases")
        
        # Top schemes
        print("\nTop fraud schemes:")
        for scheme in SCHEME_TYPES[:5]:
            count = db.query(FraudCase).filter(FraudCase.scheme_type == scheme["type"]).count()
            amount = db.query(func.sum(FraudCase.amount_exposed)).filter(
                FraudCase.scheme_type == scheme["type"]
            ).scalar() or 0
            print(f"  {scheme['type']}: {count:,} cases (${amount:,.0f})")
        
    finally:
        db.close()


if __name__ == "__main__":
    import sys
    force = "--force" in sys.argv
    seed_database(force_reseed=force)
