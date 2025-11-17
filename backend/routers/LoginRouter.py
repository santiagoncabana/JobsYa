from fastapi import APIRouter, Depends, HTTPException
from backend.database.database import get_db
from sqlalchemy.orm import Session
from backend.crud.LoginCrud import create_usuario, autenticacion_usuario
from backend.schemas.LoginSchema import ClienteRegister, ClienteLogin


router = APIRouter()

#Register Cliente
@router.post("/register", tags=["registro Usuario"])
def registerCliente(usuario: ClienteRegister, db: Session = Depends(get_db)):
    db_usuario = create_usuario(db, usuario)
    return {"message": "Cliente registrado exitosamente"}

#Login Cliente
@router.post("/login", tags=["login cliente"])
def loginCliente(usuario: ClienteLogin, db: Session = Depends(get_db)):
    user = autenticacion_usuario(db, usuario.email, usuario.contrasena)
    if user:
        return {"message": "Autenticación exitosa", "email": user.email}
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")