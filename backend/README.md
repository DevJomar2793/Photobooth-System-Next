# SnapCapture backend

Run the API from this directory with `uvicorn main:app --reload` after installing
`requirements.txt`.

Configuration is optional for local development:

- `DATABASE_URL`: SQLite is used by default; provide a PostgreSQL connection URL in production.
- `UPLOAD_DIR`: directory for uploaded images; defaults to `backend/uploads/images`.

Keep real connection strings in an untracked `.env` file or a deployment secret manager.
