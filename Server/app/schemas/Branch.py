from pydantic import BaseModel
from typing import Optional

# For creating a branch
class BranchCreate(BaseModel):
    name: str
    district: str
    sector: str
    cell: str
    village: str

# For updating a branch (all optional)
class BranchUpdate(BaseModel):
    name: Optional[str]
    district: Optional[str]
    sector: Optional[str]
    cell: Optional[str]
    village: Optional[str]

# For responses
class BranchResponse(BranchCreate):
    id: str
