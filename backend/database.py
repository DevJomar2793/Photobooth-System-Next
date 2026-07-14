import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# Use the local SQLite database by default. Production should provide DATABASE_URL
# through the environment (for example, a Supabase PostgreSQL connection string).
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{BASE_DIR / 'images.db'}"

# Some hosting providers still expose the legacy postgres:// scheme. SQLAlchemy
# needs an explicit PostgreSQL driver for either common scheme.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

if DATABASE_URL.startswith("sqlite:"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL.startswith("postgresql+"):
    is_local_database = "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL
    connect_args = {} if is_local_database else {"sslmode": "require"}
else:
    connect_args = {}

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
