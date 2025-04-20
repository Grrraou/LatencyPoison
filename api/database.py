from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

# Use a proper path in the Docker environment
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////data/users.db")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    collections = relationship("Collection", back_populates="owner")

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="collections")
    endpoints = relationship("Endpoint", back_populates="collection", cascade="all, delete-orphan")

class Endpoint(Base):
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    url = Column(String)
    method = Column(String)
    headers = Column(JSON)
    body = Column(JSON)
    collection_id = Column(Integer, ForeignKey("collections.id"))
    collection = relationship("Collection", back_populates="endpoints")
    fail_rate = Column(Integer, default=0)
    min_latency = Column(Integer, default=0)
    max_latency = Column(Integer, default=1000)
    sandbox = Column(Boolean, default=False)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 