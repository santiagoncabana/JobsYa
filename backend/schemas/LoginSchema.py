from pydantic import BaseModel

#Registro
class ClienteRegister(BaseModel):
    email:str
    contrasena:str
    nombre:str
    apellido:str


#login
class ClienteLogin(BaseModel):
    email:str
    contrasena:str