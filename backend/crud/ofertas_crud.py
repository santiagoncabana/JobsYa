from sqlalchemy.orm import Session
from backend.schemas.ofertas_schemas import OfertaBase, FormularioCreate
from backend.database.models import Oferta, Empresa, Formulario
import json

def crear_postulacion(db: Session, formulario: FormularioCreate, id_usuario: int):
    # Verificar que la oferta existe
    oferta = db.query(Oferta).filter(Oferta.id_oferta == formulario.id_oferta).first()
    if not oferta:
        return None


    titulos_json = json.dumps(formulario.titulos, ensure_ascii=False)
    habilidades_json = json.dumps(
        [{"nombre": h.nombre, "nivel": h.nivel} for h in formulario.habilidades],
        ensure_ascii=False
    )


    nuevo_formulario = Formulario(
        id_oferta=formulario.id_oferta,
        id_usuario=id_usuario,
        nombre=formulario.nombre,
        email=formulario.email,
        telefono=formulario.telefono,
        salario_minimo=formulario.salario_minimo,
        jornada_disponible=formulario.jornada_disponible,
        titulos=titulos_json,
        habilidades=habilidades_json
    )

    db.add(nuevo_formulario)
    db.commit()
    db.refresh(nuevo_formulario)

    return nuevo_formulario


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

#obtener ofertas de una empresa
def obtener_postulaciones_por_empresa(db: Session, cuit: str):
    """Obtiene todas las postulaciones de ofertas de una empresa específica"""
    return db.query(Formulario).join(Oferta).join(Empresa).filter(
        Empresa.cuit == cuit
    ).all()
    
def obtener_postulaciones_por_oferta(db: Session, id_oferta: int):
    """Obtiene todas las postulaciones de una oferta específica"""
    return db.query(Formulario).filter(Formulario.id_oferta == id_oferta).all()

#obtener todas las ofertas
def obtener_todas_ofertas(db: Session):
    return db.query(Oferta).all()