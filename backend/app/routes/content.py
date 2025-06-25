from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from ..models.content import ContentItemCreate, ContentItemInDB
from ..models.user import UserInDB
from ..core.security import get_current_user
from ..db.database import db

router = APIRouter()

@router.post("/content", response_model=ContentItemInDB, status_code=status.HTTP_201_CREATED)
async def create_content_item(
    content: ContentItemCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    # Prevent duplicate entries
    existing_item = await db.content.find_one({
        "owner_username": current_user["username"],
        "url": str(content.url)
    })
    if existing_item:
        raise HTTPException(status_code=409, detail="This content is already in your list.")

    content_item = ContentItemInDB(
        **content.dict(),
        owner_username=current_user["username"]
    )
    await db.content.insert_one(content_item.dict())
    return content_item

@router.get("/users/{username}/content", response_model=List[ContentItemInDB])
async def get_user_content(username: str):
    items = await db.content.find({"owner_username": username}).to_list(length=100)
    return items