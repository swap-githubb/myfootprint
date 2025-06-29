from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime, timezone 

# This model is for creating content. It's what the extension sends.
class ContentItemCreate(BaseModel):
    url: HttpUrl
    title: str
    summary: str
    content_type: str = "article"

# This model represents the data structure in the database and what we return from the API.
class ContentItemInDB(ContentItemCreate):

    id: str = Field(..., alias="_id")
    owner_username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
    
        populate_by_name = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}