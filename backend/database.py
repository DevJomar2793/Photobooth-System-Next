from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except Exception:
    pass

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://db_projects_fqbk_user:fSUhzFrdqOckOUFylHRFSBsGv6E6bdru@dpg-d7fiarnaqgkc739r2fbg-a.singapore-postgres.render.com/db_projects_fqbk")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is missing in environment variables")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg2://"
    )

connect_args = {}
if "localhost" not in DATABASE_URL and "127.0.0.1" not in DATABASE_URL and "sqlite" not in DATABASE_URL:
    connect_args["sslmode"] = "require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args=connect_args
)

Sessionlocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()