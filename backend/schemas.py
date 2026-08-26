"""Response shapes shared by the image API routes."""
from datetime import datetime

from pydantic import BaseModel


class ImageResponse(BaseModel):
    id: int
    filename: str
    original_name: str | None
    user: str | None
    file_size: float
    width: int
    height: int
    captured_at: datetime | None
    url: str


class UploadImageResponse(BaseModel):
    message: str
    image: ImageResponse


class MessageResponse(BaseModel):
    message: str
