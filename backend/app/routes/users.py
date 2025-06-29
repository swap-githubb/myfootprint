from fastapi import APIRouter, Depends, HTTPException, status
from ..core.security import get_current_user
from ..db.database import db
from ..models.user import UserPublic
from typing import List
import re

router = APIRouter()


# This route fetches the public profile of a user
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


# This route allows a user to follow another user
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


# This route allows a user to unfollow another user
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



# This route allows searching for users by username
@router.get("/search/users", response_model=List[UserPublic])
async def search_for_users(query: str, current_user: dict = Depends(get_current_user)):
    if not query:
        return []

    # Use a case-insensitive regular expression for the search
    regex = re.compile(f'.*{re.escape(query)}.*', re.IGNORECASE)
    
    # Find users matching the regex, but exclude the current user from the results
    cursor = db.users.find({
        "username": {"$regex": regex, "$ne": current_user["username"]}
    })
    
    users = await cursor.to_list(length=20) 

    # We need to process the results to match the UserPublic model
    results = []
    current_user_following = current_user.get("following", [])

    for user in users:
        is_following = user["username"] in current_user_following
        results.append(
            UserPublic(
                username=user["username"],
                email=user["email"],
                following_count=len(user.get("following", [])),
                followers_count=len(user.get("followers", [])),
                is_followed_by_current_user=is_following
            )
        )
    
    return results



# This routes fetches the list of users that the current user is following
@router.get("/users/{username}/following", response_model=List[str])
async def get_following_list(username: str):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("following", [])



# This routes fetches the list of users who are following the current user
@router.get("/users/{username}/followers", response_model=List[str])
async def get_followers_list(username: str):
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.get("followers", [])
