from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransactionModel(BaseModel):
    id: Optional[str] = None 
    business_id: str
    payer_phone: str = Field(..., pattern=r"^\+250[7][2,3,8,9]\d{7}$")
    date: datetime
    amount: float = Field(..., gt=0) 
    plan: str = Field(..., pattern="^(month|year|lifetime)$") 
    confirm: bool = False  
    created_at: Optional[datetime] = None