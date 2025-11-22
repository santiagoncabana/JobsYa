from sqlalchemy.orm import Session
from backend.schemas.ofertas_schemas import OfertaBase
from backend.database.models import Oferta, Empresa


# Crear una nueva oferta de trabajo
def create_oferta(db: Session, oferta_data: OfertaBase, cuit: str):
    # Buscar la empresa por CUIT
    empresa = db.query(Empresa).filter(Empresa.cuit == cuit).first()
    
    # Validar que la empresa existe
    if not empresa:
        raise ValueError(f"No se encontró una empresa con el CUIT: {cuit}")
    
    # Crear la oferta con el id_empresa obtenido
    db_oferta = Oferta(
        cuit=cuit,  # Guardar el CUIT
        id_empresa=empresa.id_empresa,  # Relacionar con id_empresa automáticamente
        nombre_puesto=oferta_data.nombre_puesto,
        descripcion_puesto=oferta_data.descripcion_puesto,
        rango_salarial_min=oferta_data.rango_salarial_min,
        rango_salarial_max=oferta_data.rango_salarial_max,
        jornada=oferta_data.jornada
    )
    
    db.add(db_oferta)
    db.commit()
    db.refresh(db_oferta)
    
    return db_oferta