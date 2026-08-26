"""Application settings that can be changed through environment variables."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads" / "images"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_ORIGINS = [
    "https://photobooth-app-omega.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]
