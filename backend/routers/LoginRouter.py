from fastapi import APIRouter, Depends, HTTPException
from backend.database.database import get_db
from sqlalchemy.orm import Session
from backend.crud.LoginCrud import create_usuario, autenticacion_usuario
from backend.schemas.LoginSchema import ClienteRegister, ClienteLogin, CuentaEmpresaRegister, CuentaEmpresaLogin
from backend.crud.LoginCrud import create_empresa, autenticacion_empresa


router = APIRouter()

#Register Cliente
@router.post("/register", tags=["registro Usuario"])
def registerCliente(usuario: ClienteRegister, db: Session = Depends(get_db)):
    db_usuario = create_usuario(db, usuario)
    return {"message": "Cliente registrado exitosamente"}

@router.post("/register_empresa", tags=["registro Empresa"])
def registerEmpresa(empresa: CuentaEmpresaRegister, db: Session = Depends(get_db)):
    db_empresa = create_empresa(db, empresa)
    return {"message": "Empresa registrada exitosamente"}

#Login Cliente
@router.post("/login", tags=["login usuario"])
def loginCliente(usuario: ClienteLogin, db: Session = Depends(get_db)):
    user = autenticacion_usuario(db, usuario.email, usuario.contrasena)
    if user:
        return {
            "message": "Autenticación exitosa", 
            "email": user.email,
            "nombre": user.nombre,      
            "apellido": user.apellido   
        }
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

@router.post("/login_empresa", tags=["login empresa"])
def loginEmpresa(empresa: CuentaEmpresaLogin, db: Session = Depends(get_db)):
    emp = autenticacion_empresa(db, empresa.email, empresa.contrasena)
    if emp:
        return {"message": "Autenticación exitosa", "email": emp.email}
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")