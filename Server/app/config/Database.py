from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables from .env
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("stockwise")  # No collections yet

# Async function to check MongoDB connection
async def check_connection():
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)
