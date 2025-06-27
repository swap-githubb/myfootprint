from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, content # Add other routers as you create them

app = FastAPI()

# IMPORTANT: Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Your React frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, tags=["auth"])
app.include_router(content.router, tags=["content"])

@app.get("/")
def read_root():
    return {"Hello": "World"}