
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .base import Base

# DATABASE_URL = "mysql+pymysql://root@localhost/jobsya"
DATABASE_URL = "postgresql://postgres:1234@localhost:5432/JobsYa"

# Engine correcto
engine = create_engine(DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Session = SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Compatibilidad: algunos módulos importan `create_engine` desde aquí
create_engine = engine

__all__ = ["engine", "create_engine", "SessionLocal", "Session", "get_db"]
# ...existing code...