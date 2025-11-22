from fastapi import APIRouter, Depends, HTTPException
from backend.database.database import get_db
from sqlalchemy.orm import Session
from backend.crud.ofertas_crud import OfertaBase, create_oferta
from backend.schemas.ofertas_schemas import OfertaBase
from backend.database.models import Oferta

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