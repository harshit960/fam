from fastapi import FastAPI
from dotenv import load_dotenv
import threading

from youtube import monitor_youtube

load_dotenv()

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    """Start the YouTube monitoring when the app starts"""
    monitoring_thread = threading.Thread(target=monitor_youtube, daemon=True)
    monitoring_thread.start()
    print("YouTube monitoring started in background")

@app.get("/")
def read_root():
    return {"Hello": "World"}


