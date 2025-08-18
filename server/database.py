import os
from typing import List, Dict, Any
from sqlmodel import create_engine, SQLModel, Session, select
from dotenv import load_dotenv

from models import Videos

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost:5432/database_name")
engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

# Validate YouTube video item
def validate_video_item(item: Dict[str, Any]) -> bool:
    required_fields = [
        ("id", "videoId"),
        ("snippet", "publishedAt"),
        ("snippet", "channelId"),
        ("snippet", "title"),
        ("snippet", "description"),
        ("snippet", "thumbnails"),
        ("snippet", "channelTitle"),
    ]
    for parent, key in required_fields:
        if parent not in item:
            return False
        if key not in item[parent]:
            return False
    thumbnails = item["snippet"]["thumbnails"]
    if "default" not in thumbnails or "url" not in thumbnails["default"]:
        return False
    return True


def insert_videos_in_db(items: List[Dict[str, Any]]) -> List[Videos]:
    """    
    Args:
        items: List of YouTube search result items
    Returns:
        List of created Videos objects
    """
    videos_to_insert = []
    
    for item in items:
        if not validate_video_item(item):
            continue

        video_id = item["id"]["videoId"] 
        video_kind = item["kind"] if "kind" in item else "unknown"
        snippet = item["snippet"]
        thumbnail_url = snippet.get("thumbnails", {})["default"]["url"] if "thumbnails" in snippet else ""

        video = Videos(
            video_id=video_id,
            video_kind=video_kind,
            published_at=snippet["publishedAt"],
            channel_id=snippet["channelId"],
            title=snippet["title"],
            description=snippet["description"],
            channel_title=snippet["channelTitle"],
            thumbnail_url=thumbnail_url
        )
        
        videos_to_insert.append(video)
    
    new_video_ids = [video.video_id for video in videos_to_insert]
    
    with Session(engine) as session:
        existing_video_ids = session.exec(
            select(Videos.video_id).where(Videos.video_id.in_(new_video_ids))
        ).all()
        
        existing_ids_set = set(existing_video_ids)
        new_videos = [video for video in videos_to_insert if video.video_id not in existing_ids_set]
        
        if new_videos:
            session.add_all(new_videos)
            session.commit()
            
            for video in new_videos:
                session.refresh(video)
    
    return new_videos

