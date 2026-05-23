"""
main.py – FastAPI Image Capture Backend
Routes:
  POST   /api/images/upload       – Upload captured image
  GET    /api/images               – List all images
  GET    /api/images/{id}          – Get single image metadata
  DELETE /api/images/{id}          – Delete image
  GET    /api/images/{id}/download – Download image file
  GET    /uploads/{filename}       – Static image serving
"""
import os
import uuid
import shutil
from datetime import datetime
from typing import Optional, List

from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy.orm import Session
from PIL import Image as PILImage

import models
import database

# ── Directories ────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(title="SnapCapture API", version="1.0.0", docs_url="/api/docs")

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

# Delete DB tables
# models.Base.metadata.drop_all(bind=database.engine)

# CORS – allow Vite dev server and any origin in dev

origins = [
    "https://photobooth-system-ten.vercel.app",
    "http://localhost:5173",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded images
app.mount("/uploads", StaticFiles(directory=os.path.join(BASE_DIR, "uploads")), name="uploads")


# ── Helper ─────────────────────────────────────────────────────────────────────
def image_to_dict(img: models.Image) -> dict:
    return {
        "id": img.id,
        "filename": img.filename,
        "original_name": img.original_name,
        "user": img.user,
        "file_size": round(img.file_size, 2),
        "width": img.width,
        "height": img.height,
        "captured_at": img.captured_at.isoformat() if img.captured_at else None,
        "url": f"/uploads/images/{img.filename}",
    }


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "SnapCapture API is running", "docs": "/api/docs"}


@app.get("/api/images", response_model=List[dict])
def list_images(db: Session = Depends(database.get_db)):
    """Return all captured images sorted by newest first."""
    images = db.query(models.Image).order_by(models.Image.captured_at.desc()).all()
    return [image_to_dict(img) for img in images]


@app.get("/api/images/{image_id}")
def get_image(image_id: int, db: Session = Depends(database.get_db)):
    img = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    return image_to_dict(img)


@app.post("/api/images/upload", status_code=201)
async def upload_image(
    file: UploadFile = File(...),
    user: Optional[str] = Form(default="Anonymous"),
    original_name: Optional[str] = Form(default="capture"),
    db: Session = Depends(database.get_db),
):
    """Accept a JPEG/PNG image file and save it with metadata."""
    # Validate content type
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WebP images are accepted.")

    # Generate unique filename
    ext = "jpg" if file.content_type == "image/jpeg" else ("webp" if file.content_type == "image/webp" else "png")
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Get image dimensions and size
    try:
        with PILImage.open(file_path) as pil_img:
            width, height = pil_img.size
    except Exception:
        width, height = 0, 0

    file_size_kb = os.path.getsize(file_path) / 1024

    # Save metadata to DB
    db_image = models.Image(
        filename=unique_name,
        original_name=original_name or "capture",
        user=user or "Anonymous",
        file_size=file_size_kb,
        width=width,
        height=height,
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)

    return {
        "message": "Image uploaded successfully",
        "image": image_to_dict(db_image),
    }


@app.delete("/api/images/{image_id}")
def delete_image(image_id: int, db: Session = Depends(database.get_db)):
    """Delete image from DB and disk."""
    img = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    # Delete file from disk
    file_path = os.path.join(UPLOAD_DIR, img.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(img)
    db.commit()
    return {"message": f"Image {image_id} deleted successfully"}


@app.get("/api/images/{image_id}/download")
def download_image(image_id: int, db: Session = Depends(database.get_db)):
    """Return image file as a downloadable attachment."""
    img = db.query(models.Image).filter(models.Image.id == image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")

    file_path = os.path.join(UPLOAD_DIR, img.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image file not found on disk")

    return FileResponse(
        path=file_path,
        media_type="image/jpeg",
        filename=f"snapcapture_{img.id}.jpg",
        headers={"Content-Disposition": f'attachment; filename="snapcapture_{img.id}.jpg"'},
    )
