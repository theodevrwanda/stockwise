from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta

class BusinessModel(BaseModel):
    id: Optional[str] = None
    
    name: str
    district: str
    sector: str
    cell: str
    village: str
    
    plan: str = Field(default="free", pattern="^(free|standard|business)$")
    duration: str = Field(default="lifetime", pattern="^(month|year|lifetime)$")
    start_date: datetime = Field(default_factory=datetime.utcnow)
    # Smart end_date — NO dateutil needed!
    end_date: datetime = Field(
        default_factory=lambda: datetime(2099, 12, 31)  # lifetime = never ends
    )
    is_active: bool = True
    photo: str = "https://api.dicebear.com/7.x/shapes/svg?seed={{name}}"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None