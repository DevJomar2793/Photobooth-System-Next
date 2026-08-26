"""Integration tests for the stable image API contract."""
import io
import os
import sys
import tempfile
from pathlib import Path

from PIL import Image

TEST_DIRECTORY = Path(tempfile.mkdtemp(prefix="snapcapture-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DIRECTORY / 'images.db'}"
os.environ["UPLOAD_DIR"] = str(TEST_DIRECTORY / "uploads" / "images")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient  # noqa: E402
from fastapi import UploadFile  # noqa: E402
from main import app  # noqa: E402
from repositories import images as image_repository  # noqa: E402
from services import images as image_service  # noqa: E402
import database  # noqa: E402

client = TestClient(app)


def make_image() -> bytes:
    image = Image.new("RGB", (12, 8), "purple")
    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")
    return buffer.getvalue()


def test_upload_get_download_and_delete_image():
    upload = client.post(
        "/api/images/upload",
        files={"file": ("capture.jpg", make_image(), "image/jpeg")},
        data={"user": "Test User", "original_name": "test-capture"},
    )
    assert upload.status_code == 201
    image = upload.json()["image"]
    assert image["width"] == 12
    assert image["height"] == 8
    assert image["url"].endswith(image["filename"])

    listed = client.get("/api/images")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [image["id"]]

    assert client.get(f"/api/images/{image['id']}").json()["filename"] == image["filename"]
    download = client.get(f"/api/images/{image['id']}/download")
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("image/jpeg")

    deleted = client.delete(f"/api/images/{image['id']}")
    assert deleted.status_code == 200
    assert client.get(f"/api/images/{image['id']}").status_code == 404


def test_missing_image_returns_not_found():
    assert client.get("/api/images/999").status_code == 404
    assert client.delete("/api/images/999").status_code == 404
    assert client.get("/api/images/999/download").status_code == 404


def test_removes_file_when_database_save_fails(monkeypatch):
    def fail_to_save(*_args):
        raise RuntimeError("database is unavailable")

    monkeypatch.setattr(image_repository, "add_image", fail_to_save)
    upload = UploadFile(filename="capture.jpg", file=io.BytesIO(make_image()))
    upload.headers = {"content-type": "image/jpeg"}
    db = database.SessionLocal()
    before = list((TEST_DIRECTORY / "uploads" / "images").iterdir())

    try:
        try:
            image_service.create_image(db, upload, "Test User", "capture")
        except RuntimeError:
            pass
        else:
            raise AssertionError("Expected the database write to fail")
    finally:
        db.close()

    assert list((TEST_DIRECTORY / "uploads" / "images").iterdir()) == before


def test_rejects_non_image_uploads():
    response = client.post(
        "/api/images/upload",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Only JPEG, PNG, or WebP images are accepted."
