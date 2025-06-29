from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.content import ContentItemCreate, ContentItemInDB
from ..models.user import UserInDB
from ..core.security import get_current_user
from ..db.database import db
from datetime import datetime, timezone

router = APIRouter()

# This route handles the creation of new content items.
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
    
    
    content_to_save = content.model_dump()
    content_to_save['owner_username'] = current_user["username"]
    content_to_save['created_at'] = datetime.now(timezone.utc) 
    content_to_save['url'] = str(content_to_save['url'])

    insert_result = await db.content.insert_one(content_to_save)

    created_doc = await db.content.find_one({"_id": insert_result.inserted_id})
    created_doc["_id"] = str(created_doc["_id"])

    return created_doc


# This route fetches all content items for a specific user.
@router.get("/users/{username}/content", response_model=List[ContentItemInDB])
async def get_user_content(username: str):
    
    items_cursor = db.content.find({"owner_username": username})
    
    results = []
    for item in await items_cursor.to_list(length=100):
        item["_id"] = str(item["_id"])
        results.append(item)
        
    return results


# This route fetches the content items of users who the current user is following and display in current user's feed.
@router.get("/feed", response_model=List[ContentItemInDB])
async def get_my_feed(current_user: dict = Depends(get_current_user)):
    following_list = current_user.get("following", [])
    
    cursor = db.content.find({"owner_username": {"$in": following_list}})
    
    
    results = []
    for item in await cursor.sort("created_at", -1).to_list(length=100):
        item["_id"] = str(item["_id"])
        results.append(item)
        
    return results
