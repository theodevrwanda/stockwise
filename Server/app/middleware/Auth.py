# app/middleware/auth.py
from fastapi import Request, HTTPException, status
from app.utils.firebase import admin_auth  # your firebase admin
from app.config.Database import db
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

USER_COLLECTION = db.get_collection("users")

async def protect(request: Request, call_next):
    """
    FastAPI middleware: Protect routes
    Equivalent to your Express `exports.protect`
    """
    token = None

    # 1. Extract token from headers or cookies
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        logger.info(f"Token from Bearer header: {token[:20]}...")
    elif request.cookies.get("token"):
        token = request.cookies.get("token")
        logger.info(f"Token from cookie: {token[:20]}...")

    # 2. No token → 401
    if not token:
        logger.warning("Access denied: No token provided")
        raise HTTPException(
            status_code=401,
            detail="Not authorized, no token provided. Please login again."
        )

    try:
        # 3. Verify Firebase ID token
        logger.info("Verifying Firebase token...")
        decoded_token = await admin_auth.verify_id_token(token)
        uid = decoded_token["uid"]
        logger.info(f"Token verified successfully | UID: {uid}")

        # 4. Find user in MongoDB
        user = await USER_COLLECTION.find_one({"_id": uid})
        if not user:
            logger.warning(f"User not found in DB | UID: {uid}")
            raise HTTPException(
                status_code=404,
                detail="User not found. Please log in again."
            )

        # 5. Check if user is active
        if not user.get("isActive", False):
            logger.warning(f"Inactive user attempted access | UID: {uid}")
            raise HTTPException(
                status_code=403,
                detail="Account is not activated. Please contact support."
            )

        # 6. Staff must have a branch
        role = user.get("role")
        branch = user.get("branch")
        if role == "staff" and not branch:
            logger.warning(f"Staff user without branch | UID: {uid}")
            raise HTTPException(
                status_code=403,
                detail="Staff user must be assigned to a branch to access this resource"
            )

        # 7. Attach user to request.state.user (like req.user)
        request.state.user = {
            "_id": user["_id"],
            "role": role,
            "username": user.get("username"),
            "branch": str(branch) if branch else None
        }
        logger.info(f"User authenticated | {role.upper()} | {user.get('username')} | Branch: {branch}")

        # 8. Continue to route
        return await call_next(request)

    except Exception as error:
        error_msg = str(error)
        logger.error(f"Token verification failed: {error_msg}")
        raise HTTPException(
            status_code=401,
            detail="Not authorized, token failed."
        )