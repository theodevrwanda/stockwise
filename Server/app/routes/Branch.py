from fastapi import APIRouter, HTTPException, status
from app.models.Branch import BranchModel
from app.schemas.Branch import BranchCreate, BranchUpdate
from app.config.Database import db
from bson import ObjectId
from typing import List
import logging
from datetime import datetime

# Configure logging to show in terminal
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/branches", tags=["Branches"])
BRANCH_COLLECTION = db.get_collection("branches")

# --------------------------
# Helper function
# --------------------------
def branch_helper(branch) -> dict:
    """Convert MongoDB document to dict (used internally only)"""
    return {
        "id": str(branch["_id"]),
        "name": branch.get("name"),
        "district": branch.get("district"),
        "sector": branch.get("sector"),
        "cell": branch.get("cell"),
        "village": branch.get("village"),
    }

# --------------------------
# Create a branch
# --------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_branch(branch: BranchCreate):
    logger.info(f"CREATE request received for branch: {branch.name}")
    
    existing_branch = await BRANCH_COLLECTION.find_one({"name": branch.name})
    if existing_branch:
        logger.warning(f"Branch creation failed - Name already exists: {branch.name}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Branch already exists")

    branch_dict = branch.dict()
    logger.info(f"Inserting new branch into database: {branch_dict}")
    
    result = await BRANCH_COLLECTION.insert_one(branch_dict)
    
    if result.inserted_id:
        logger.info(f"Branch created successfully | ID: {str(result.inserted_id)} | Name: {branch.name}")
        return {"message": "Branch created successfully"}
    else:
        logger.error(f"Failed to insert branch into database: {branch.name}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create branch")

# --------------------------
# Get all branches
# --------------------------
@router.get("/", status_code=status.HTTP_200_OK)
async def get_branches():
    logger.info("GET all branches request received")
    
    branches = []
    count = 0
    async for b in BRANCH_COLLECTION.find():
        branches.append(branch_helper(b))
        count += 1
    
    logger.info(f"Retrieved {count} branch(es) from database")
    return {"message": "Branches retrieved successfully", "data": branches}

# --------------------------
# Get single branch by ID
# --------------------------
@router.get("/{branch_id}", status_code=status.HTTP_200_OK)
async def get_branch(branch_id: str):
    logger.info(f"GET branch request | ID: {branch_id}")
    
    if not ObjectId.is_valid(branch_id):
        logger.warning(f"Invalid branch ID format: {branch_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID")

    branch = await BRANCH_COLLECTION.find_one({"_id": ObjectId(branch_id)})
    if not branch:
        logger.warning(f"Branch not found | ID: {branch_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    
    branch_data = branch_helper(branch)
    logger.info(f"Branch found and returned | ID: {branch_id} | Name: {branch_data['name']}")
    return {"message": "Branch retrieved successfully", "data": branch_data}

# --------------------------
# Update branch
# --------------------------
@router.put("/{branch_id}", status_code=status.HTTP_200_OK)
async def update_branch(branch_id: str, branch: BranchUpdate):
    logger.info(f"UPDATE request received | Branch ID: {branch_id} | Updates: {branch.dict(exclude_unset=True)}")
    
    if not ObjectId.is_valid(branch_id):
        logger.warning(f"Invalid branch ID format during update: {branch_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID")

    update_data = branch.dict(exclude_unset=True)
    if not update_data:
        logger.warning("Update request with no fields to update")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update")

    result = await BRANCH_COLLECTION.update_one(
        {"_id": ObjectId(branch_id)}, {"$set": update_data}
    )
    
    if result.matched_count == 0:
        logger.warning(f"Update failed - Branch not found | ID: {branch_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")

    logger.info(f"Branch updated successfully | ID: {branch_id} | Modified fields: {list(update_data.keys())}")
    return {"message": "Branch updated successfully"}

# --------------------------
# Delete branch
# --------------------------
@router.delete("/{branch_id}", status_code=status.HTTP_200_OK)
async def delete_branch(branch_id: str):
    logger.info(f"DELETE request received | Branch ID: {branch_id}")
    
    if not ObjectId.is_valid(branch_id):
        logger.warning(f"Invalid branch ID format during delete: {branch_id}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid branch ID")

    result = await BRANCH_COLLECTION.delete_one({"_id": ObjectId(branch_id)})
    
    if result.deleted_count == 0:
        logger.warning(f"Delete failed - Branch not found | ID: {branch_id}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Branch not found")
    
    logger.info(f"Branch deleted successfully | ID: {branch_id}")
    return {"message": "Branch deleted successfully"}