from pydantic import BaseModel

#Oferta trabajo

class OfertaBase(BaseModel):
    nombre_puesto: str
    descripcion_puesto: str | None = None
    rango_salarial_min: float | None = None
    rango_salarial_max: float | None = None
    jornada: str | None = None
    
    class Config:
        from_atributes=True