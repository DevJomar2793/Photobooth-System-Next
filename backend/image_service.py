"""Small, testable helpers for saving and serializing captured images."""
import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image as PILImage

import models
from config import UPLOAD_DIR

CONTENT_TYPES = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp"}


def image_to_dict(image: models.Image) -> dict:
    """Convert a database image record to the public API shape."""
    return {
        "id": image.id,
        "filename": image.filename,
        "original_name": image.original_name,
        "user": image.user,
        "file_size": round(image.file_size, 2),
        "width": image.width,
        "height": image.height,
        "captured_at": image.captured_at,
        "url": f"/uploads/images/{image.filename}",
    }


def save_upload(upload: UploadFile) -> tuple[str, Path]:
    """Validate an upload and save it under a generated filename."""
    extension = CONTENT_TYPES.get(upload.content_type or "")
    if not extension:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted.")

    filename = f"{uuid.uuid4().hex}.{extension}"
    path = UPLOAD_DIR / filename
    with path.open("wb") as destination:
        shutil.copyfileobj(upload.file, destination)
    return filename, path


def image_details(path: Path) -> tuple[int, int, float]:
    """Return width, height, and size in kilobytes for a saved image."""
    try:
        with PILImage.open(path) as image:
            width, height = image.size
    except OSError:
        width, height = 0, 0
    return width, height, path.stat().st_size / 1024
