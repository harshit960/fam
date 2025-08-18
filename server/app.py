import os
from typing import Union
from fastapi import FastAPI
from sqlmodel import Session, select
from dotenv import load_dotenv

from database import engine
from models import Hero

load_dotenv()

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


