from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from bson import ObjectId
from datetime import datetime

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    firstName: str
    lastName: str
    phone: str = Field(..., regex=r"^\+?[1-9]\d{1,14}$")
    district: str
    sector: str
    cell: str
    village: str
    role: str = Field("staff", pattern="^(admin|staff)$")
    branch: Optional[str] = None  # ObjectId as string
    imagephoto: str = "https://example.com/default-user-photo.png"
    isActive: bool = False

    class Config:
        json_encoders = {
            ObjectId: str
        }

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserInDB(UserBase):
    _id: str
    createdAt: datetime
    updatedAt: datetime