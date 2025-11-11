from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from datetime import datetime, timedelta
import logging

# --- Real Imports from Utility and Config Files --
from app.models.Business import BusinessModel
from app.models.User import UserModel

# External Services
from app.utils.Cloudinary import upload_file
from app.utils.Email import sender
from app.utils.Firebase import create_firebase_user, db as firestore_db 

# Database Collections (MongoDB)
from app.config.Database import Businesses, Users

# --------------------------------------------------
logger = logging.getLogger(__name__)
router = APIRouter()

# --- User Info (Injected for Logging) ---
CURRENT_TIME = "November 11, 2025 02:17 PM CAT"
USER_COUNTRY = "RW"
# --------------------------------------------------

@router.post("/register", tags=["Public"])
async def register_account(
    first_name: str = Form(..., description="User first name"),
    last_name: str = Form(..., description="User last name"),
    email: str = Form(..., description="User email (unique)"),
    password: str = Form(..., description="User password for Firebase Auth"),
    phone: str = Form(..., description="User phone number (e.g., +250...)"),
    gender: str = Form(..., description="User gender (male/female/other)"),
    business_name: str = Form(..., description="Business name"),
    district: str = Form(..., description="Business district"),
    sector: str = Form(..., description="Business sector"),
    cell: str = Form(..., description="Business cell"),
    village: str = Form(..., description="Business village"),
    user_photo: Optional[UploadFile] = File(None, description="Optional user profile photo"),
    business_photo: Optional[UploadFile] = File(None, description="Optional business logo/photo")
):
    """
    PUBLIC ENDPOINT - NO AUTH REQUIRED
    Creates business + admin user with full logging.
    """
    try:
        # Trim inputs
        business_name = business_name.strip()
        email = email.strip().lower()
        phone = phone.strip()

        print(f"\n[REGISTER START] {CURRENT_TIME} | Country: {USER_COUNTRY}")
        print(f"  → Request: {first_name} {last_name} | {email} | {phone} | Business: '{business_name}'")

        # 1. Check business name (case-insensitive)
        print("  → Checking business name...")
        existing_biz = await Businesses.find_one({"name": {"$regex": f"^{business_name}$", "$options": "i"}})
        if existing_biz:
            print(f"  → Business name '{business_name}' already exists")
            logger.warning(f"Duplicate business name: {business_name}")
            raise HTTPException(status_code=400, detail="Business name already exists")

        # 2. Check email or phone
        print("  → Checking email & phone...")
        existing_user = await Users.find_one({"$or": [{"email": email}, {"phone": phone}]})
        if existing_user:
            if existing_user.get("email") == email:
                print(f"  → Email '{email}' already in use")
                raise HTTPException(status_code=400, detail="Email already in use")
            if existing_user.get("phone") == phone:
                print(f"  → Phone '{phone}' already in use")
                raise HTTPException(status_code=400, detail="Phone number already in use")

        print("  → Uniqueness checks passed")

        # 3. Default avatars
        full_name = f"{first_name.strip()} {last_name.strip()}"
        default_user_url = f"https://api.dicebear.com/7.x/avataaars/svg?seed={first_name}{last_name}"
        default_biz_url = f"https://api.dicebear.com/7.x/shapes/svg?seed={business_name.replace(' ', '')}"
        user_photo_url = default_user_url
        business_photo_url = default_biz_url

        # 4. Upload user photo
        if user_photo and user_photo.filename:
            print(f"  → Uploading user photo: {user_photo.filename}")
            user_photo_url = await upload_file(
                file=user_photo,
                folder="stockwise/users/rwanda",
                prefix=email.split("@")[0]
            )
            print(f"  → User photo uploaded: {user_photo_url}")

        # 5. Upload business photo
        if business_photo and business_photo.filename:
            print(f"  → Uploading business photo: {business_photo.filename}")
            business_photo_url = await upload_file(
                file=business_photo,
                folder="stockwise/businesses/rwanda",
                prefix=business_name.replace(" ", "_").lower()
            )
            print(f"  → Business photo uploaded: {business_photo_url}")

        # 6. Create business (30-day trial)
        print("  → Creating business with 30-day free trial...")
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=30)
        expiry_display = end_date.strftime("%B %d, %Y")

        business = BusinessModel(
            name=business_name,
            district=district.strip(),
            sector=sector.strip(),
            cell=cell.strip(),
            village=village.strip(),
            plan="free",
            duration="month",
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            photo=business_photo_url,
            created_at=start_date,
            updated_at=start_date
        )

        # 7. Save to MongoDB
        result = await Businesses.insert_one(business.model_dump(by_alias=True, exclude_none=True))
        business_id = str(result.inserted_id)
        print(f"  → Business saved to MongoDB: {business_id}")

        # 8. Sync to Firestore
        firestore_db.collection("businesses").document(business_id).set(business.model_dump(exclude_none=True))
        print(f"  → Business synced to Firestore")

        # 9. Create Firebase Auth user
        print(f"  → Creating Firebase Auth user...")
        firebase_user = create_firebase_user(email=email, password=password, display_name=full_name)
        firebase_uid = firebase_user.uid
        print(f"  → Firebase user created: {firebase_uid}")

        # 10. Create user model
        user = UserModel(
            id=firebase_uid,
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            email=email,
            phone=phone,
            gender=gender.strip(),
            role="admin",
            business_id=business_id,
            is_active=True,
            photo=user_photo_url,
            created_at=start_date,
            updated_at=start_date
        )

        # 11. Save user to MongoDB
        await Users.insert_one(user.model_dump(by_alias=True, exclude_none=True))
        print(f"  → User saved to MongoDB")

        # 12. Sync to Firestore
        firestore_db.collection("users").document(firebase_uid).set(user.model_dump(exclude_none=True))
        print(f"  → User synced to Firestore")

        # 13. Send welcome email
        print(f"  → Sending welcome email to {email}...")
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #007bff;">Welcome to StockWise, {full_name}!</h2>
            <p>Your business <strong>{business_name}</strong> has been successfully registered.</p>
            <p><strong>Free Trial:</strong> 1 Month | Expires: <strong>{expiry_display}</strong></p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="https://stockwise.rw/login" style="background:#28a745;color:#fff;padding:12px 25px;text-decoration:none;border-radius:5px;font-weight:bold;">
                    Log In Now
                </a>
            </div>
            <p style="font-size:14px;color:#6c757d;">Contact support if needed.</p>
        </div>
        """
        await sender(to=email, subject="Welcome to StockWise! Free Trial Active", html=html_content)
        print(f"  → Welcome email sent")

        # 14. Success
        print(f"[REGISTER SUCCESS] User: {firebase_uid} | Business: {business_id}\n")
        logger.info(f"Registration successful: {email} | Business: {business_name}")

        return {
            "success": True,
            "message": "Account created. Welcome email sent!",
            "user_id": firebase_uid,
            "business_id": business_id,
            "user_role": "admin",
            "trial_expires": expiry_display,
            "user_photo_url": user_photo_url,
            "business_photo_url": business_photo_url,
        }

    except HTTPException:
        print(f"[REGISTER FAILED] Validation error\n")
        raise
    except Exception as e:
        error_msg = str(e)
        print(f"[REGISTER FAILED] Unexpected error: {error_msg}\n")
        logger.error(f"Registration failed for {email}: {error_msg}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")