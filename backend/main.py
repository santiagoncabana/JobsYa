"""from fastapi import FastAPI
from backend.database.database import create_engine
from backend.database.base import Base
from backend.routers.LoginRouter import loginCliente, registerCliente

Base.metadata.create_all(bind=create_engine)

app = FastAPI()

app.include_router(registerCliente.router)
app.include_router(loginCliente.router)"""


from fastapi import FastAPI

from backend.database.database import engine
from backend.database.base import Base
from backend.routers.LoginRouter import router as login_router
from backend.routers import ofertas_router as ofertas_router
from backend.routers import filtrosbusqueda_router

# Import models so SQLAlchemy knows about them before create_all()
import backend.database.models  # noqa: F401


app = FastAPI()


# Create database tables (safe to call on startup in development)
Base.metadata.create_all(bind=engine)


# Register routers
app.include_router(login_router, prefix="/auth")

app.include_router(ofertas_router.router, prefix="/api")

app.include_router(filtrosbusqueda_router.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "ok", "message": "JobsYa API"}