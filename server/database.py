import os
from sqlmodel import create_engine, SQLModel
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/database_name")

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)
