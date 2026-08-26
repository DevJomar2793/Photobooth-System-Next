"""Database queries for captured images."""
from sqlalchemy.orm import Session

import models


def list_images(db: Session) -> list[models.Image]:
    return db.query(models.Image).order_by(models.Image.captured_at.desc()).all()


def get_image(db: Session, image_id: int) -> models.Image | None:
    return db.query(models.Image).filter(models.Image.id == image_id).first()


def add_image(db: Session, image: models.Image) -> models.Image:
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def delete_image(db: Session, image: models.Image) -> None:
    db.delete(image)
    db.commit()
