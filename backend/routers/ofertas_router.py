from fastapi import APIRouter, Depends, HTTPException
from backend.database.database import get_db
from sqlalchemy.orm import Session
from backend.crud.ofertas_crud import create_oferta,obtener_postulaciones_por_oferta,obtener_todas_ofertas, obtener_ofertas_por_empresa, obtener_postulaciones_por_empresa
from backend.schemas.ofertas_schemas import OfertaBase
# from backend.schemas.ofertas_schemas import OfertaBase, OfertaDetalle
from backend.database.models import Oferta
from backend.schemas.ofertas_schemas import FormularioCreate, FormularioResponse
from typing import List


from backend.crud.ofertas_crud import (
    crear_postulacion,
    obtener_postulaciones_por_oferta
)
import json

router = APIRouter()
# --------------------------------------------------------------------------------------------------------

@router.post("/CrearOfertas")
def crear_oferta(cuit: str, oferta_data: OfertaBase, db: Session = Depends(get_db)):
    try:
        nueva_oferta = create_oferta(db=db, cuit=cuit, oferta_data=oferta_data)
        return {
            "mensaje": "Oferta creada exitosamente",
            "id_oferta": nueva_oferta.id_oferta,
            "id_empresa": nueva_oferta.id_empresa,
            "cuit": nueva_oferta.cuit,
            "descripcion": nueva_oferta.descripcion_puesto,
            "requisitos": nueva_oferta.requisitos,
            "beneficios": nueva_oferta.beneficios,


        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear oferta: {str(e)}")
# --------------------------------------------------------------------------------------------------------
    

    
@router.get("/ofertas-por-empresa/")
def obtener_ofertas(cuit: str, db: Session = Depends(get_db)):
    ofertas = obtener_ofertas_por_empresa(db=db, cuit=cuit)
    return ofertas



# ------------------------------------------------------------------------------

@router.get("/ofertas/todas", response_model=list[OfertaBase])
def todas_ofertas(db: Session = Depends(get_db)):
    ofertas = obtener_todas_ofertas(db)
    return ofertas

# --------------------------------------------------------------------------------




@router.post("/postulacion/oferta/{id_oferta}")
def crear_postulacion_endpoint(
    id_oferta: int,
    formulario: FormularioCreate,
    db: Session = Depends(get_db)
):
    nueva_postulacion = crear_postulacion(
        db=db,
        id_oferta=id_oferta,
        formulario=formulario
    )
    
    if not nueva_postulacion:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    return {
        "mensaje": "Postulación enviada exitosamente",
        "id_formulario": nueva_postulacion.id_formulario
    }


# --------------------------------------------------------------------------------------------------------

@router.get("/postulaciones/empresa/{cuit_empresa}", response_model=list[dict])
def get_postulaciones_empresa(cuit_empresa: str, db: Session = Depends(get_db)):
    """
    Obtiene todas las postulaciones de todas las ofertas de una empresa.
    El CUIT se envía como parámetro de ruta.
    """
    postulaciones = obtener_postulaciones_por_empresa(db, cuit_empresa)
    
    if not postulaciones:
        raise HTTPException(status_code=404, detail="No se encontraron postulaciones para esta empresa")
    
    resultado = []
    for p in postulaciones:
        resultado.append({
            "id_formulario": p.id_formulario,
            "id_oferta": p.id_oferta,  # ← AGREGADO
            "nombre": p.nombre,
            "email": p.email,
            "telefono": p.telefono,
            "salario_minimo": p.salario_minimo,
            "jornada_disponible": p.jornada_disponible,
            "titulos": json.loads(p.titulos) if isinstance(p.titulos, str) else p.titulos,
            "habilidades": json.loads(p.habilidades) if isinstance(p.habilidades, str) else p.habilidades,
        })
    
    return resultado


# --------------------------------------------------------------------------------------------------------
@router.get("/postulaciones/oferta/{id_oferta}", response_model=list[dict])
def get_postulaciones_oferta(id_oferta: int, db: Session = Depends(get_db)):
    postulaciones = obtener_postulaciones_por_oferta(db, id_oferta)
    
    if not postulaciones:
        raise HTTPException(status_code=404, detail="No se encontraron postulaciones para esta oferta")
    
    resultado = []
    for p in postulaciones:
        resultado.append({
            "id_formulario": p.id_formulario,
            "id_oferta": p.id_oferta,
            "nombre": p.nombre,
            "email": p.email,
            "telefono": p.telefono,
            "salario_minimo": p.salario_minimo,
            "jornada_disponible": p.jornada_disponible,
            "titulos": json.loads(p.titulos) if isinstance(p.titulos, str) else p.titulos,
            "habilidades": json.loads(p.habilidades) if isinstance(p.habilidades, str) else p.habilidades,
        })
    
    return resultado