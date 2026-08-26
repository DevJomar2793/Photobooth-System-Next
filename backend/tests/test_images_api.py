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
from main import app  # noqa: E402

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


def test_rejects_non_image_uploads():
    response = client.post(
        "/api/images/upload",
        files={"file": ("notes.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Only JPEG, PNG, or WebP images are accepted."
