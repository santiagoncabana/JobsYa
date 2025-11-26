from typing import Dict, List
from sqlalchemy.orm import Session
from backend.schemas.ofertas_schemas import OfertaBase, FormularioCreate
from backend.database.models import Oferta, Empresa, Formulario
import json

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
        jornada=oferta_data.jornada,
        ubicacion=oferta_data.ubicacion,
        requisitos=oferta_data.requisitos,
        beneficios=oferta_data.beneficios

    )
    
    db.add(db_oferta)
    db.commit()
    db.refresh(db_oferta)
    
    return db_oferta

def crear_postulacion(db: Session, id_oferta: int, formulario: FormularioCreate):
    oferta = db.query(Oferta).filter(Oferta.id_oferta == id_oferta).first()
    if not oferta:
        return None
    
    titulos_json = json.dumps(formulario.titulos, ensure_ascii=False)
    habilidades_json = json.dumps(
        [{"nombre": h.nombre, "nivel": h.nivel} for h in formulario.habilidades],
        ensure_ascii=False
    )
    
    nuevo_formulario = Formulario(
        id_oferta=id_oferta,
        # id_usuario ELIMINADO
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
    
def obtener_postulaciones_por_empresa(db: Session, cuit_empresa: str):
    return db.query(Formulario)\
        .join(Oferta, Formulario.id_oferta == Oferta.id_oferta)\
        .filter(Oferta.cuit == cuit_empresa)\
        .all()


def obtener_postulaciones_por_oferta(db: Session, id_oferta: int):
    """
    Obtiene todas las postulaciones de una oferta específica
    """
    return db.query(Formulario)\
        .filter(Formulario.id_oferta == id_oferta)\
        .all()

# -------------------------------------------------------------------------------------------
#obtener todas las ofertas
# def obtener_todas_ofertas(db: Session):
#     return db.query(Oferta).all()
# -------------------------------------------------------------------------------------------

def obtener_ofertas_por_empresa(db: Session, cuit: str):
    return db.query(Oferta).filter(Oferta.cuit == cuit).all()


# -------------------------------------------------------------------------------------------

def obtener_todas_ofertas(db: Session) -> List[Dict]:
    # Paso 1: Obtener TODAS las ofertas de la base de datos
    ofertas_db = db.query(Oferta).all() 
    
    ofertas_procesadas = []
    
    for oferta_obj in ofertas_db:
        # Convertir el objeto de SQLAlchemy a un diccionario para manipularlo
        oferta_dict = oferta_obj.__dict__.copy()
        oferta_dict.pop('_sa_instance_state', None)
        
        # 🛑 FUNCIÓN CLAVE DE PARSEO 🛑
        def parsear_campo_jsonb(campo_str):
            """Convierte la cadena JSONB de la DB a una lista de Python."""
            valor = oferta_dict.get(campo_str)
            if isinstance(valor, str):
                try:
                    return json.loads(valor)
                except (json.JSONDecodeError, TypeError):
                    print(f"Error al parsear campo {campo_str} para oferta {oferta_dict.get('id_oferta')}")
                    return []
            return valor if valor is not None else [] 

        oferta_dict['requisitos'] = parsear_campo_jsonb('requisitos')
        oferta_dict['beneficios'] = parsear_campo_jsonb('beneficios')
        
        
        ofertas_procesadas.append(oferta_dict)
        
    return ofertas_procesadas