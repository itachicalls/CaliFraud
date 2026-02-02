"""
California County SQLAlchemy model
"""

from sqlalchemy import Column, Integer, String
from geoalchemy2 import Geography
from app.db.database import Base


class CACounty(Base):
    __tablename__ = "ca_counties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True)
    fips_code = Column(String(5), unique=True)
    boundary = Column(Geography(geometry_type="MULTIPOLYGON", srid=4326))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "fips_code": self.fips_code,
        }
