"""Application settings that can be changed through environment variables."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads" / "images"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DEFAULT_ALLOWED_ORIGINS = [
    "https://photobooth-app-omega.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]


def allowed_origins() -> list[str]:
    """Read optional comma-separated CORS origins from the environment."""
    value = os.getenv("ALLOWED_ORIGINS")
    if not value:
        return DEFAULT_ALLOWED_ORIGINS
    return [origin.strip() for origin in value.split(",") if origin.strip()]
