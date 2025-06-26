# from pydantic import BaseModel, EmailStr

# class UserCreate(BaseModel):
#     username: str
#     email: EmailStr
#     password: str

# class UserInDB(BaseModel):
#     username: str
#     email: EmailStr
#     hashed_password: str

# class Token(BaseModel):
#     access_token: str
#     token_type: str


from pydantic import BaseModel, EmailStr
from typing import List

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

# This model is returned when fetching a public profile
class UserPublic(UserBase):
    following_count: int = 0
    followers_count: int = 0
    # This field will be dynamically set based on the request user
    is_followed_by_current_user: bool = False

class UserInDB(UserBase):
    hashed_password: str
    following: List[str] = [] # List of usernames this user follows
    followers: List[str] = [] # List of usernames who follow this user

class Token(BaseModel):
    access_token: str
    token_type: str