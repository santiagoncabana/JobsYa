from pydantic import BaseModel



#Empresa esquema

class Empresa(BaseModel):
    id_empresa: int
    nombre: str
    cuit: str

    class Config:
        orm_mode = True