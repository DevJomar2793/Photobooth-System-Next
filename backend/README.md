# SnapCapture backend

Run the API from this directory with `uvicorn main:app --reload` after installing
`requirements.txt`.

The code is split by responsibility:

- `routers/`: HTTP endpoints and response codes.
- `services/`: image and file workflows.
- `repositories/`: database queries.
- `schemas.py`, `models.py`, `database.py`, and `config.py`: data shapes and setup.

Configuration is optional for local development:

- `DATABASE_URL`: SQLite is used by default; provide a PostgreSQL connection URL in production.
- `UPLOAD_DIR`: directory for uploaded images; defaults to `backend/uploads/images`.

Keep real connection strings in an untracked `.env` file or a deployment secret manager.
