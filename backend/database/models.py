from sqlalchemy import Column, Integer, String, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from backend.database.base import Base

candidato_habilidad = Table(
    'candidato_habilidad',
    Base.metadata,
    Column('id_candidato', Integer, ForeignKey('candidato.id_candidato'), primary_key=True),
    Column('id_habilidad', Integer, ForeignKey('habilidad.id_habilidad'), primary_key=True)
)

class Empresa(Base):
    __tablename__ = "empresa"

    id_empresa = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(30))

    ofertas = relationship("Oferta", back_populates="empresa")

class Oferta(Base):
    __tablename__ = "oferta"

    id_oferta = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey("empresa.id_empresa"), nullable=False)

    nombre_puesto = Column(String(150), nullable=False)
    descripcion_puesto = Column(String(500))
    rango_salarial_min = Column(Float)
    rango_salarial_max = Column(Float)
    jornada = Column(String(50))

    empresa = relationship("Empresa", back_populates="ofertas")
    requisitos = relationship("OfertaRequisito", back_populates="oferta")
    titulos = relationship("OfertaTitulo", back_populates="oferta")

class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(120), nullable=False, unique=True)
    contrasena = Column(String(200), nullable=False)
    nombre = Column(String(20), nullable=False)
    apellido = Column(String(20), nullable=False)

class Titulo(Base):
    __tablename__ = "titulo"

    id_titulo = Column(Integer, primary_key=True)
    nombre_titulo = Column(String(150), nullable=False)

    candidatos = relationship("CandidatoCitad", back_populates="titulo")
    ofertas = relationship("OfertaTitulo", back_populates="titulo")

class CandidatoCitad(Base):
    __tablename__ = "candidato_citad"

    id_candidato = Column(Integer, primary_key=True)
    nombre = Column(String(150))
    telefono = Column(String(30))
    salario_minimo = Column(Float)
    full_time = Column(String(30))

    id_titulo = Column(Integer, ForeignKey("titulo.id_titulo"))

    titulo = relationship("Titulo", back_populates="candidatos")

class Candidato(Base):
    __tablename__ = "candidato"

    id_candidato = Column(Integer, primary_key=True)
    nombre = Column(String(150))
    email = Column(String(120))
    telefono = Column(String(30))
    salario_minimo_pant = Column(Float)
    jornada_disponible = Column(String(50))

    habilidades = relationship("Habilidad", secondary=candidato_habilidad, backref="candidatos")

class Habilidad(Base):
    __tablename__ = "habilidad"

    id_habilidad = Column(Integer, primary_key=True)
    nivel = Column(Integer)

    requisitos = relationship("OfertaRequisito", back_populates="habilidad")

class OfertaRequisito(Base):
    __tablename__ = "oferta_requisito"

    id_oferta = Column(Integer, ForeignKey("oferta.id_oferta"), primary_key=True)
    id_habilidad = Column(Integer, ForeignKey("habilidad.id_habilidad"), primary_key=True)

    nivel_minimo = Column(Integer, nullable=False)

    oferta = relationship("Oferta", back_populates="requisitos")
    habilidad = relationship("Habilidad", back_populates="requisitos")

class OfertaTitulo(Base):
    __tablename__ = "oferta_titulo"

    id_oferta = Column(Integer, ForeignKey("oferta.id_oferta"), primary_key=True)
    id_titulo = Column(Integer, ForeignKey("titulo.id_titulo"), primary_key=True)

    oferta = relationship("Oferta", back_populates="titulos")
    titulo = relationship("Titulo", back_populates="ofertas")
