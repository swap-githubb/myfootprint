from fastapi import APIRouter, Depends, HTTPException, status
from ..core.security import get_current_user
from ..db.database import db
from ..models.user import UserPublic

router = APIRouter()

@router.get("/users/{username}", response_model=UserPublic)
async def get_user_profile(username: str, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the currently authenticated user is following the profile user
    is_following = username in current_user.get("following", [])

    return UserPublic(
        username=user["username"],
        email=user["email"],
        following_count=len(user.get("following", [])),
        followers_count=len(user.get("followers", [])),
        is_followed_by_current_user=is_following
    )

@router.post("/users/{username_to_follow}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def follow_user(username_to_follow: str, current_user: dict = Depends(get_current_user)):
    if username_to_follow == current_user["username"]:
        raise HTTPException(status_code=400, detail="You cannot follow yourself")

    user_to_follow = await db.users.find_one({"username": username_to_follow})
    if not user_to_follow:
        raise HTTPException(status_code=404, detail="User to follow not found")

    # Add to current user's "following" list
    await db.users.update_one(
        {"username": current_user["username"]},
        {"$addToSet": {"following": username_to_follow}}
    )
    # Add current user to the other user's "followers" list
    await db.users.update_one(
        {"username": username_to_follow},
        {"$addToSet": {"followers": current_user["username"]}}
    )

@router.delete("/users/{username_to_unfollow}/follow", status_code=status.HTTP_204_NO_CONTENT)
async def unfollow_user(username_to_unfollow: str, current_user: dict = Depends(get_current_user)):
    # Remove from current user's "following" list
    await db.users.update_one(
        {"username": current_user["username"]},
        {"$pull": {"following": username_to_unfollow}}
    )
    # Remove current user from the other user's "followers" list
    await db.users.update_one(
        {"username": username_to_unfollow},
        {"$pull": {"followers": current_user["username"]}}
    )