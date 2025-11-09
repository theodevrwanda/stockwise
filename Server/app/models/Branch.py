from pydantic import BaseModel
from typing import Optional

class BranchModel(BaseModel):
    id: Optional[str] = None  # MongoDB _id
    name: str
    district: str
    sector: str
    cell: str
    village: str
