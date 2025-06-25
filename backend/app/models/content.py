from pydantic import BaseModel, HttpUrl
from datetime import datetime

class ContentItemCreate(BaseModel):
    url: HttpUrl
    title: str
    summary: str
    content_type: str = "article" # or "video"

class ContentItemInDB(ContentItemCreate):
    owner_username: str
    created_at: datetime = datetime.utcnow()