from fastapi import FastAPI
from backend.database.database import engine
from backend.database.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()
