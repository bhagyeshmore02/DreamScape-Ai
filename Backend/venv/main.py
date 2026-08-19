from fastapi import FastAPI
from routes.projects import router as projects_router

app = FastAPI(
    title="DreamScape AI API",
    description="AI-powered house design platform",
    version="1.0.0"
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