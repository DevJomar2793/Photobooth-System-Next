"""Database model for captured images."""
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, nullable=False)
    original_name = Column(String, nullable=True)
    user = Column(String, default="Anonymous")
    file_size = Column(Float, default=0.0)
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    captured_at = Column(DateTime(timezone=True), server_default=func.now())
