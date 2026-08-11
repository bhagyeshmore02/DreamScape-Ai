from fastapi import FastAPI

app = FastAPI(
    title="DreamScape AI API",
    description="Backend API for DreamScape AI",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "DreamScape AI Backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }