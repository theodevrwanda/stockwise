from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
class UserModel(BaseModel):
    id: Optional[str] = None 
    # User Info
    first_name: str
    last_name: str
    email: EmailStr
    phone: str = Field(..., pattern=r"^\+250[7][2,3,8,9]\d{7}$")
    gender: str = Field(..., pattern="^(male|female|other)$")
    role: str = Field(..., pattern="^(admin|staff)$")
    branch_id: Optional[str] = None
    business_id: str
    is_active: bool = True
    photo: str = "https://api.dicebear.com/7.x/avataaars/svg?seed={{first_name}}{{last_name}}"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None