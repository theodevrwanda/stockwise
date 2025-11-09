# app/utils/upload.py
import time
import random
from fastapi import UploadFile, HTTPException
from app.utils.cloudinary import cloudinary 
import logging

# Logging (clean & beautiful)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# =============================================
# MAIN UPLOADER FUNCTION (exported directly)
# =============================================
def uploader(
    folder_name: str = "ems/default",
    max_size_mb: int = 15,
    allowed_types: list = None
):
    """
    Returns a ready-to-use async upload function
    Just like your Node.js: module.exports = (folderName) => multer(...)
    
    Usage:
        upload_avatar = uploader("ems/avatars")
        result = await upload_avatar(file, user)
    """
    if allowed_types is None:
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    logger.info(f"Cloudinary uploader initialized → folder: {folder_name} | max: {max_size_mb}MB")

    async def upload_file(file: UploadFile, current_user: dict = None):
        filename = file.filename or "unknown"
        content_type = file.content_type or ""

        # 1. File type check
        if content_type not in allowed_types:
            logger.warning(f"Rejected: {filename} | Type: {content_type}")
            raise HTTPException(400, "Invalid file type. Only images allowed.")

        # 2. Read + size check
        contents = await file.read()
        if len(contents) > max_size_mb * 1024 * 1024:
            size_mb = len(contents) / 1024 / 1024
            logger.warning(f"File too large: {filename} ({size_mb:.2f}MB)")
            raise HTTPException(400, f"File too large. Max {max_size_mb}MB.")

        # 3. Unique public_id
        timestamp = int(time.time() * 1000)
        rand = random.randint(0, 1_000_000_000)
        username = (current_user or {}).get("username", "guest")
        public_id = f"{username}-{timestamp}-{rand}"

        logger.info(f"Uploading → {folder_name}/{public_id}")

        # 4. Upload to Cloudinary
        try:
            result = cloudinary.upload(
                file=contents,
                folder=folder_name,
                public_id=public_id,
                format="png",
                overwrite=True,
                resource_type="image",
                quality="auto",
                fetch_format="auto"
            )
            logger.info(f"Upload success | {result['secure_url']}")
            return result

        except Exception as e:
            logger.error(f"Upload failed: {e}")
            raise HTTPException(500, "Image upload failed")

    return upload_file