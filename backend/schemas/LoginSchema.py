from pydantic import BaseModel

#Registro
class ClienteRegister(BaseModel):
    email:str
    contrasena:str
    nombre:str
    apellido:str



class CuentaEmpresaRegister(BaseModel):
    email:str
    contrasena:str
    nombre:str
    cuit:str



#login
class ClienteLogin(BaseModel):
    email:str
    contrasena:str



class CuentaEmpresaLogin(BaseModel):
    email:str
    contrasena:str


