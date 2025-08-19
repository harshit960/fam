from fastapi import FastAPI, Query
from typing import Dict, Any, List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import threading

from youtube import monitor_youtube
from database import get_videos_paginated
from models import Videos

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)
@app.on_event("startup")
async def startup_event():
    """Start the YouTube monitoring when the app starts"""
    monitoring_thread = threading.Thread(target=monitor_youtube, daemon=True)
    monitoring_thread.start()
    print("YouTube monitoring started in background")

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/videos")
def get_videos(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100)
) -> Dict[str, Any]:
    """    
    Args:
        page: Page number
        page_size: Number of videos per page
    Returns:
        Paginated response with videos data and metadata
    """
    videos, total_count = get_videos_paginated(page, page_size)
    total_pages = (total_count + page_size - 1) // page_size  
    has_next = page < total_pages
    has_previous = page > 1
    
    return {
        "data": videos,
        "pagination": {
            "current_page": page,
            "page_size": page_size,
            "total_count": total_count,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous,
            "next_page": page + 1 if has_next else None,
            "previous_page": page - 1 if has_previous else None
        }
    }


