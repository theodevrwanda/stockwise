from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables from .env
load_dotenv()

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI")

# Connect to MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("stockwise")

# Collections
Users = db.get_collection('Users')
Businesses = db.get_collection('Businesses')
Branches = db.get_collection('Branches')
Transactions = db.get_collection('Transactions')
Products = db.get_collection('Products')

# Optional: Async function to test connection
async def check_connection():
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print("❌ MongoDB connection failed:", e)

# Run connection test if this file is executed directly
if __name__ == "__main__":
    asyncio.run(check_connection())
