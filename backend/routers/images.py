"""HTTP endpoints for captured images."""
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import database
from image_service import image_to_dict
from repositories import images as image_repository
from schemas import ImageResponse, MessageResponse, UploadImageResponse
from services import images as image_service

router = APIRouter(prefix="/api/images", tags=["images"])
DatabaseSession = Annotated[Session, Depends(database.get_db)]


@router.get("", response_model=list[ImageResponse])
def list_images(db: DatabaseSession):
    return [image_to_dict(image) for image in image_repository.list_images(db)]


@router.get("/{image_id}", response_model=ImageResponse)
def get_image(image_id: int, db: DatabaseSession):
    return image_to_dict(image_service.require_image(db, image_id))


@router.post("/upload", status_code=201, response_model=UploadImageResponse)
def upload_image(
    file: Annotated[UploadFile, File()],
    db: DatabaseSession,
    user: Annotated[str | None, Form()] = "Anonymous",
    original_name: Annotated[str | None, Form()] = "capture",
):
    image = image_service.create_image(db, file, user, original_name)
    return {"message": "Image uploaded successfully", "image": image_to_dict(image)}


@router.delete("/{image_id}", response_model=MessageResponse)
def delete_image(image_id: int, db: DatabaseSession):
    image_service.delete_image(db, image_id)
    return {"message": f"Image {image_id} deleted successfully"}


@router.get("/{image_id}/download")
def download_image(image_id: int, db: DatabaseSession):
    image = image_service.require_image(db, image_id)
    path = image_service.image_path(image)
    media_type = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}.get(
        path.suffix.lower(), "application/octet-stream"
    )
    return FileResponse(path=path, media_type=media_type, filename=f"snapcapture_{image.id}{path.suffix}")
