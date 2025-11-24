from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database.models import Oferta
from backend.database.database import get_db
from backend.schemas.filtro_schemas import Empresa
from backend.crud.filtrosbusqueda_crud import get_empresas, obtener_todas_empresas

router = APIRouter()

@router.get(
    "/empresas/", 
    response_model=list[Empresa], # Especificamos que devuelve una lista del Schema Empresa
    tags=["Empresas"]
)
def read_empresas(
    # Los parámetros de la función se convierten en Query Parameters (?nombre=...)
    nombre: str | None = Query(None, description="Buscar por nombre parcial de la empresa."),
    db: Session = Depends(get_db)
):
 
    # Llamar a la función CRUD con todos los parámetros
    empresas = get_empresas(
        db, 
        nombre=nombre,
    )
    
    return empresas


@router.get("/empresas/todas", response_model=list[Empresa])
def get_todas_empresas(db: Session = Depends(get_db)):
    empresas = obtener_todas_empresas(db)
    return empresas