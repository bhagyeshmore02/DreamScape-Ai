from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routes.projects import router as projects_router

app = FastAPI(
    title="DreamScape AI API",
    description="AI-powered house design platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to DreamScape AI API"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
