"""Image business logic: database records and files stay in sync here."""
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

import models
from config import UPLOAD_DIR
from image_service import image_details, save_upload
from repositories import images as image_repository


def require_image(db: Session, image_id: int) -> models.Image:
    image = image_repository.get_image(db, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


def create_image(
    db: Session,
    upload: UploadFile,
    user: str | None,
    original_name: str | None,
) -> models.Image:
    """Save an upload and its metadata, removing the file if the DB write fails."""
    filename, path = save_upload(upload)
    width, height, file_size = image_details(path)
    image = models.Image(
        filename=filename,
        original_name=original_name or "capture",
        user=user or "Anonymous",
        file_size=file_size,
        width=width,
        height=height,
    )

    try:
        return image_repository.add_image(db, image)
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise


def delete_image(db: Session, image_id: int) -> models.Image:
    """Delete a database record and its uploaded file."""
    image = require_image(db, image_id)
    image_repository.delete_image(db, image)
    (UPLOAD_DIR / image.filename).unlink(missing_ok=True)
    return image


def image_path(image: models.Image) -> Path:
    path = UPLOAD_DIR / image.filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image file not found on disk")
    return path
