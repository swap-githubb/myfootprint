from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, content, users

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(content.router, tags=["content"])
app.include_router(users.router, tags=["users"])

@app.get("/")
def read_root():
    return {"Hello": "Welcome to MyFootprint App API!"}