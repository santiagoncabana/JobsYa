from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.base import Base

DATABASE_URL = "mysql+pymysql://root:password@localhost/jobya"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
