from sqlalchemy.orm import Session
from backend.database.models import Usuario 
from backend.schemas.LoginSchema import ClienteRegister, ClienteLogin

def create_usuario(db: Session, usuario_data: ClienteRegister):
    db_usuario = Usuario(
        email=usuario_data.email,
        contrasena=usuario_data.contrasena,
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def autenticacion_usuario(db: Session, correo: str, contrasena_user: str):
    usuario = db.query(Usuario).filter(Usuario.email == correo).first()
    
    if not usuario:
        return None
    
    # Asumo que 'contraseña' es el nombre correcto del campo en tu modelo
    if usuario.contrasena == contrasena_user: 
        return usuario
    return None