from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ..db.database import db
from ..models.user import UserCreate, UserInDB, Token
from ..core import security

router = APIRouter()

@router.post("/users/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = security.get_password_hash(user.password)
    user_in_db = UserInDB(username=user.username, email=user.email, hashed_password=hashed_password)
    await db.users.insert_one(user_in_db.dict())
    return {"message": "User registered successfully"}


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})
    if not user or not security.verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}