from fastapi import APIRouter, Depends, HTTPException
from backend.database.database import get_db
from sqlalchemy.orm import Session
from backend.crud.ofertas_crud import OfertaBase, create_oferta,obtener_postulaciones_por_oferta,obtener_todas_ofertas
from backend.schemas.ofertas_schemas import OfertaBase
from backend.database.models import Oferta
from backend.schemas.ofertas_schemas import FormularioCreate, FormularioResponse
from backend.crud.ofertas_crud import (
    crear_postulacion,
    obtener_postulaciones_por_empresa,
    obtener_postulaciones_por_oferta
)
import json

router = APIRouter()

@router.post("/ofertas/")
def crear_oferta(cuit: str, oferta_data: OfertaBase, db: Session = Depends(get_db)):
    try:
        nueva_oferta = create_oferta(db=db, cuit=cuit, oferta_data=oferta_data)
        return {
            "mensaje": "Oferta creada exitosamente",
            "id_oferta": nueva_oferta.id_oferta,
            "id_empresa": nueva_oferta.id_empresa,
            "cuit": nueva_oferta.cuit
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear oferta: {str(e)}")
    
    
@router.get("/ofertas/")
def obtener_ofertas(cuit: str, db: Session = Depends(get_db)):
    ofertas = obtener_postulaciones_por_oferta(db=db, cuit=cuit)
    return ofertas

@router.get("/ofertas/todas", response_model=list[OfertaBase])
def todas_ofertas(db: Session = Depends(get_db)):
    ofertas = obtener_todas_ofertas(db)
    return ofertas


router = APIRouter()

@router.post("/postulacion/crear", response_model=dict)
def crear_postulacion_endpoint(
    formulario: FormularioCreate,
    db: Session = Depends(get_db),
    id_usuario: int = 1  # TODO: Obtener del token de autenticación
):
    nueva_postulacion = crear_postulacion(db, formulario, id_usuario)
    
    if not nueva_postulacion:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    
    return {
        "mensaje": "Postulación enviada exitosamente",
        "id_formulario": nueva_postulacion.id_formulario
    }

@router.get("/postulaciones/empresa/{cuit}", response_model=list[dict])
def get_postulaciones_empresa(cuit: str, db: Session = Depends(get_db)):
    """Obtiene todas las postulaciones de ofertas de una empresa"""
    postulaciones = obtener_postulaciones_por_empresa(db, cuit)
    
    resultado = []
    for p in postulaciones:
        resultado.append({
            "id_formulario": p.id_formulario,
            "nombre": p.nombre,
            "email": p.email,
            "telefono": p.telefono,
            "salario_minimo": p.salario_minimo,
            "jornada_disponible": p.jornada_disponible,
            "titulos": json.loads(p.titulos),
            "habilidades": json.loads(p.habilidades),
            "nombre_puesto": p.oferta.nombre_puesto,
            "nombre_empresa": p.oferta.empresa.nombre
        })
    
    return resultado

@router.get("/postulaciones/oferta/{id_oferta}", response_model=list[dict])
def get_postulaciones_oferta(id_oferta: int, db: Session = Depends(get_db)):
    """Obtiene todas las postulaciones de una oferta específica"""
    postulaciones = obtener_postulaciones_por_oferta(db, id_oferta)
    
    resultado = []
    for p in postulaciones:
        resultado.append({
            "id_formulario": p.id_formulario,
            "nombre": p.nombre,
            "email": p.email,
            "telefono": p.telefono,
            "salario_minimo": p.salario_minimo,
            "jornada_disponible": p.jornada_disponible,
            "titulos": json.loads(p.titulos),
            "habilidades": json.loads(p.habilidades),
            "nombre_puesto": p.oferta.nombre_puesto,
            "nombre_empresa": p.oferta.empresa.nombre
        })
    
    return resultado