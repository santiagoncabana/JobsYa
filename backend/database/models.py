# Librerias
from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from backend.database.base import Base

# Produccion SQL:

class Empresa(Base):
    __tablename__ = "empresa"

    id_empresa = Column(Integer, primary_key=True, index=True)
    email = Column(String(32), nullable=False)
    contrasena = Column(String(32), nullable=False)
    nombre = Column(String(32), nullable=False)
    cuit = Column(String(32), nullable=False)

    ofertas = relationship("Oferta", back_populates="empresa")


class Oferta(Base):
    __tablename__ = "oferta"
    
    id_oferta = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey("empresa.id_empresa"), nullable=False)
    
    cuit = Column(String(32), nullable=False)
    
    nombre_puesto = Column(String(32), nullable=False)
    descripcion_puesto = Column(String(32))
    rango_salarial_min = Column(Float)
    rango_salarial_max = Column(Float)
    jornada = Column(String(32))
    
    # Relación con Empresa
    empresa = relationship("Empresa", back_populates="ofertas")
    formulario = relationship("Formulario", back_populates="oferta")
    
class Formulario(Base):
    __tablename__ = "formulario"

    id_formulario = Column(Integer, primary_key=True, autoincrement=True)
    id_oferta = Column(Integer, ForeignKey("oferta.id_oferta"), nullable=False)

    nombre = Column(String(150), nullable=False)
    email = Column(String(120), nullable=False)
    telefono = Column(String(30), nullable=False)
    salario_minimo = Column(Float, nullable=False)
    jornada_disponible = Column(String(50), nullable=False)
    titulos = Column(String(500))
    habilidades = Column(String(1000))

    oferta = relationship("Oferta", backref="postulaciones")
    

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(32), nullable=False, unique=True)
    contrasena = Column(String(32), nullable=False)
    nombre = Column(String(32), nullable=False)
    apellido = Column(String(32), nullable=False)
