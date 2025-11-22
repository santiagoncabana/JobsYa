from sqlalchemy.orm import Session
from backend.database.models import Usuario 
from backend.schemas.LoginSchema import ClienteRegister, ClienteLogin, CuentaEmpresaRegister, CuentaEmpresaLogin
from backend.database.models import Empresa

def create_usuario(db: Session, usuario_data: ClienteRegister):
    db_usuario = Usuario(
        email=usuario_data.email,
        contrasena=usuario_data.contrasena,
        nombre=usuario_data.nombre,
        apellido=usuario_data.apellido
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def autenticacion_usuario(db: Session, correo: str, contrasena_user: str):
    usuario = db.query(Usuario).filter(Usuario.email == correo).first()
    
    if not usuario:
        return None
    

    if usuario.contrasena == contrasena_user: 
        return usuario
    return None

def create_empresa(db: Session, empresa_data: CuentaEmpresaRegister):
    db_empresa = Empresa(
        email=empresa_data.email,
        contrasena=empresa_data.contrasena,
        nombre=empresa_data.nombre,
        cuit=empresa_data.cuit
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    
    return db_empresa

def autenticacion_empresa(db: Session, correo: str, contrasena_emp: str):
    empresa = db.query(Empresa).filter(Empresa.email == correo).first()
    
    if not empresa:
        return None
    
    if empresa.contrasena == contrasena_emp:
        return empresa
    return None