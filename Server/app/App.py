from fastapi import FastAPI
from app.config.Database import db, check_connection
from app.routes import Branch  # import your branch router
import asyncio

app = FastAPI(title="Stockwise Backend")

# Run MongoDB connection check on startup
@app.on_event("startup")
async def startup_event():
    await check_connection()

# Test endpoint
@app.get("/")
async def root():
    return {"message": "Stockwise Backend is running"}

# Include routers
app.include_router(Branch.router)
