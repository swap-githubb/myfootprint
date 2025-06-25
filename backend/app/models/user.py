from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserInDB(BaseModel):
    username: str
    email: EmailStr
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str