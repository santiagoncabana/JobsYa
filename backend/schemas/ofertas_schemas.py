from pydantic import BaseModel, EmailStr
from typing import List

#Oferta trabajo

class OfertaBase(BaseModel):
    nombre_puesto: str
    descripcion_puesto: str | None = None
    rango_salarial_min: float | None = None
    rango_salarial_max: float | None = None
    jornada: str | None = None
    
    class Config:
        from_atributes=True 

class HabilidadInput(BaseModel):
    nombre: str
    nivel: int  # De 1 a 5

class FormularioCreate(BaseModel):
    id_oferta: int
    nombre: str
    email: EmailStr
    telefono: str
    salario_minimo: float
    jornada_disponible: str  # "full-time" o "part-time"
    titulos: List[str]  # ["Licenciatura en Sistemas", "MBA"]
    habilidades: List[HabilidadInput]  # [{"nombre": "Python", "nivel": 4}]

class FormularioResponse(BaseModel):
    id_formulario: int
    id_oferta: int
    id_usuario: int
    nombre: str
    email: str
    telefono: str
    salario_minimo: float
    jornada_disponible: str
    titulos: str
    habilidades: str
    nombre_empresa: str  # Agregamos el nombre de la empresa
    nombre_puesto: str   # Agregamos el nombre del puesto

    class Config:
        from_attributes = True