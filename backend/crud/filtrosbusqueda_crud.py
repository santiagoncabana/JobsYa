from sqlalchemy.orm import Session
from backend.database.models import Empresa # Asegúrate de importar tu modelo SQLAlchemy

def get_empresas(
    db: Session, 
    nombre: str | None = None,
    skip: int = 0, # Para paginación
    limit: int = 100 # Para paginación
):
    # 1. Iniciar la consulta
    query = db.query(Empresa)
    
    # 2. Aplicar filtros dinámicamente usando .filter()
    if nombre:
        # Filtra por nombre (ignora mayúsculas/minúsculas y busca coincidencias parciales)
        query = query.filter(Empresa.nombre.ilike(f"%{nombre}%"))
        
        
    # 3. Aplicar paginación y ejecutar la consulta
    return query.offset(skip).limit(limit).all()