"""
models.py – SQLAlchemy ORM model for captured images
"""
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from database import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, nullable=False)        # stored UUID filename
    original_name = Column(String, nullable=True)                 # original filename or "capture"
    user = Column(String, default="Anonymous")                    # who captured it
    file_size = Column(Float, default=0.0)                        # size in KB
    width = Column(Integer, default=0)
    height = Column(Integer, default=0)
    captured_at = Column(DateTime(timezone=True), server_default=func.now())
