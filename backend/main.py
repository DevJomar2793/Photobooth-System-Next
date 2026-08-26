"""SnapCapture FastAPI application entry point.

Run locally with: ``uvicorn main:app --reload``
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import database
import models
from config import UPLOAD_DIR, allowed_origins
from routers.images import router as images_router


def create_app() -> FastAPI:
    """Create and configure the API application."""
    models.Base.metadata.create_all(bind=database.engine)

    app = FastAPI(title="SnapCapture API", version="1.0.0", docs_url="/api/docs")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR.parent), name="uploads")
    app.include_router(images_router)

    @app.get("/")
    def root():
        return {"message": "SnapCapture API is running", "docs": "/api/docs"}

    return app


app = create_app()
