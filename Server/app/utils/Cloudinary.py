# app/utils/cloudinary.py
from cloudinary import config
from dotenv import load_dotenv
import os

load_dotenv()

config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

cloudinary = __import__("cloudinary").uploader