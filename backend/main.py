"""FastAPI routes for the SnapCapture image gallery."""
from typing import Annotated

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

import database
import models
from config import ALLOWED_ORIGINS, UPLOAD_DIR
from image_service import image_details, image_to_dict, save_upload
from schemas import ImageResponse, MessageResponse, UploadImageResponse

app = FastAPI(title="SnapCapture API", version="1.0.0", docs_url="/api/docs")
models.Base.metadata.create_all(bind=database.engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR.parent), name="uploads")

DatabaseSession = Annotated[Session, Depends(database.get_db)]


def find_image(image_id: int, db: Session) -> models.Image:
    image = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image


@app.get("/")
def root():
    return {"message": "SnapCapture API is running", "docs": "/api/docs"}


@app.get("/api/images", response_model=list[ImageResponse])
def list_images(db: DatabaseSession):
    images = db.query(models.Image).order_by(models.Image.captured_at.desc()).all()
    return [image_to_dict(image) for image in images]


@app.get("/api/images/{image_id}", response_model=ImageResponse)
def get_image(image_id: int, db: DatabaseSession):
    return image_to_dict(find_image(image_id, db))


@app.post("/api/images/upload", status_code=201, response_model=UploadImageResponse)
def upload_image(
    file: Annotated[UploadFile, File()],
    db: DatabaseSession,
    user: Annotated[str | None, Form()] = "Anonymous",
    original_name: Annotated[str | None, Form()] = "capture",
):
    filename, path = save_upload(file)
    width, height, file_size = image_details(path)
    image = models.Image(
        filename=filename,
        original_name=original_name or "capture",
        user=user or "Anonymous",
        file_size=file_size,
        width=width,
        height=height,
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return {"message": "Image uploaded successfully", "image": image_to_dict(image)}


@app.delete("/api/images/{image_id}", response_model=MessageResponse)
def delete_image(image_id: int, db: DatabaseSession):
    image = find_image(image_id, db)
    path = UPLOAD_DIR / image.filename
    if path.exists():
        path.unlink()
    db.delete(image)
    db.commit()
    return {"message": f"Image {image_id} deleted successfully"}


@app.get("/api/images/{image_id}/download")
def download_image(image_id: int, db: DatabaseSession):
    image = find_image(image_id, db)
    path = UPLOAD_DIR / image.filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image file not found on disk")
    media_type = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}.get(
        path.suffix.lower(), "application/octet-stream"
    )
    return FileResponse(path=path, media_type=media_type, filename=f"snapcapture_{image.id}{path.suffix}")
