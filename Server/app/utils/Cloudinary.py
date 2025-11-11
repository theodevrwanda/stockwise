# app/utils/cloudinary.py
import cloudinary
from cloudinary import uploader
from dotenv import load_dotenv
import os
import time
import random
import logging
from fastapi import UploadFile, HTTPException

# Load config ONCE
load_dotenv()
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(message)s')
logger = logging.getLogger(__name__)

async def upload_file(
    file: UploadFile,
    folder: str,        # ← YOU DECIDE: "users/kigali", "business/nyamirambo"
    prefix: str = "user" # ← e.g. email, business_name, phone
) -> str:
    
    if not file or not file.filename:
        raise HTTPException(400, "No file selected")

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:  # 15MB max
        raise HTTPException(400, "File too big! Max 15MB")

    # Clean prefix
    clean_prefix = "".join(c for c in prefix if c.isalnum() or c in "-_")[:30]
    public_id = f"{clean_prefix}-{int(time.time())}-{random.randint(1000,9999)}"

    try:
        result = uploader.upload(
            file=contents,
            folder=folder,
            public_id=public_id,
            resource_type="image",
            format="webp",
            quality="auto",
            fetch_format="auto",
            overwrite=True
        )
        url = result["secure_url"]
        logger.info(f"Uploaded → {folder}/{public_id}")
        return url

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(500, "Failed to upload image")