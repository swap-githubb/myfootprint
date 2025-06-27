# from pydantic import BaseModel, HttpUrl
# from datetime import datetime

# class ContentItemCreate(BaseModel):
#     url: HttpUrl
#     title: str
#     summary: str
#     content_type: str = "article" # or "video"

# class ContentItemInDB(ContentItemCreate):
#     owner_username: str
#     created_at: datetime = datetime.utcnow()


from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime, timezone # Import timezone

# This model is for creating content. It's what the extension sends.
class ContentItemCreate(BaseModel):
    url: HttpUrl
    title: str
    summary: str
    content_type: str = "article"

# This model represents the data structure in the database and what we return from the API.
class ContentItemInDB(ContentItemCreate):
    # We add an `id` field that maps to MongoDB's `_id`.
    # `default_factory=str` makes it easy to work with. `alias` handles the mapping.
    id: str = Field(..., alias="_id")
    owner_username: str
    
    # This is the fix for the deprecation warning.
    # We use `datetime.now(timezone.utc)` instead of `datetime.utcnow()`.
    # `default_factory` ensures a new timestamp is created for each new item.
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        # This is crucial for Pydantic to correctly handle the `_id` alias.
        populate_by_name = True
        # This helps in serializing MongoDB's ObjectId to a string if needed,
        # though we are handling it manually for robustness.
        json_encoders = {datetime: lambda dt: dt.isoformat()}