from typing import Optional
from sqlmodel import Field, SQLModel

class Videos(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: str = Field(index=True, unique=True, nullable=False, max_length=50)
    video_kind: str = Field(nullable=False, max_length=50)
    published_at: str = Field(nullable=False) 
    channel_id: str = Field(nullable=False, max_length=100)
    title: str = Field(nullable=False)
    description: Optional[str] = Field(default=None)
    channel_title: Optional[str] = Field(default=None)
    thumbnail_url: Optional[str] = Field(default=None)
