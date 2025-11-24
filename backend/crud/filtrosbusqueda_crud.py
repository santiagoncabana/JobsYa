from sqlalchemy.orm import Session
from backend.database.models import Empresa 

def get_empresas(
    db: Session,
    nombre: str | None = None,
):
    # 1. Iniciar la consulta
    query = db.query(Empresa)
    
    if nombre:
        # Filtra por nombre 
        query = query.filter(Empresa.nombre.ilike(f"%{nombre}%"))
        
    # Ejecutar la consulta y obtener resultados
    empresas = query.all()
    return empresas


def obtener_todas_empresas(db: Session):
    return db.query(Empresa).all()