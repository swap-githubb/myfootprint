from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.content import ContentItemCreate, ContentItemInDB
from ..models.user import UserInDB
from ..core.security import get_current_user
from ..db.database import db
from datetime import datetime, timezone

router = APIRouter()

@router.post("/content", response_model=ContentItemInDB, status_code=status.HTTP_201_CREATED)
async def create_content_item(
    content: ContentItemCreate,
    current_user: dict = Depends(get_current_user)
):
    # Prevent duplicate entries by checking the URL as a string.
    existing_item = await db.content.find_one({
        "owner_username": current_user["username"],
        "url": str(content.url)
    })
    if existing_item:
        raise HTTPException(status_code=409, detail="This content is already in your list.")
    
    # 1. Convert the incoming Pydantic model to a database-friendly dictionary.
    content_to_save = content.model_dump()
    
    # 2. Add the extra fields required for the database record.
    content_to_save['owner_username'] = current_user["username"]
    content_to_save['created_at'] = datetime.now(timezone.utc) # Use the correct timestamp method.
    
    # 3. Explicitly convert the special HttpUrl object to a simple string before saving.
    #    This is the fix for the `bson.errors.InvalidDocument` crash.
    content_to_save['url'] = str(content_to_save['url'])

    # 4. Insert the clean dictionary into the database.
    insert_result = await db.content.insert_one(content_to_save)

    # 5. Fetch the newly created document from the DB to get all fields, including the `_id`.
    created_doc = await db.content.find_one({"_id": insert_result.inserted_id})
    
    # 6. Manually add the string version of the ObjectId for Pydantic validation.
    #    This ensures the returned object perfectly matches the ContentItemInDB model.
    created_doc["_id"] = str(created_doc["_id"])

    return created_doc

@router.get("/users/{username}/content", response_model=List[ContentItemInDB])
async def get_user_content(username: str):
    items = await db.content.find({"owner_username": username}).to_list(length=100)
    return items

@router.get("/feed", response_model=List[ContentItemInDB])
async def get_my_feed(current_user: dict = Depends(get_current_user)):
    following_list = current_user.get("following", [])
    
    # Find content where the owner is in the user's following list
    cursor = db.content.find({"owner_username": {"$in": following_list}})
    
    # Sort by most recent and limit to 100
    feed_items = await cursor.sort("created_at", -1).to_list(length=100)
    return feed_items
