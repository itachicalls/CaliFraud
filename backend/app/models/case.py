"""
Fraud Case SQLAlchemy model
"""

from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, func
from geoalchemy2 import Geography
from app.db.database import Base


class FraudCase(Base):
    __tablename__ = "fraud_cases"

    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    scheme_type = Column(String(50), index=True)  # telemedicine, pharmacy, dme, home_health, etc.
    amount_exposed = Column(Numeric(15, 2))
    amount_recovered = Column(Numeric(15, 2))
    date_filed = Column(Date, index=True)
    date_resolved = Column(Date)
    status = Column(String(20), default="open")  # open, settled, convicted, dismissed
    county = Column(String(50), index=True)
    city = Column(String(100))
    latitude = Column(Numeric(10, 7))
    longitude = Column(Numeric(10, 7))
    location = Column(Geography(geometry_type="POINT", srid=4326))
    source_url = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "case_number": self.case_number,
            "title": self.title,
            "description": self.description,
            "scheme_type": self.scheme_type,
            "amount_exposed": float(self.amount_exposed) if self.amount_exposed else None,
            "amount_recovered": float(self.amount_recovered) if self.amount_recovered else None,
            "date_filed": self.date_filed.isoformat() if self.date_filed else None,
            "date_resolved": self.date_resolved.isoformat() if self.date_resolved else None,
            "status": self.status,
            "county": self.county,
            "city": self.city,
            "latitude": float(self.latitude) if self.latitude else None,
            "longitude": float(self.longitude) if self.longitude else None,
            "source_url": self.source_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
