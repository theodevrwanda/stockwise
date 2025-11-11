import firebase_admin
from firebase_admin import auth, credentials, firestore
import os
from dotenv import load_dotenv

load_dotenv()

service_account = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),  # important fix
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
}

cred = credentials.Certificate(service_account)

# Initialize app only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Firebase instances
admin_auth = auth
db = firestore.client()

def create_firebase_user(email: str, password: str, display_name: str = None):
    """
    Create a new Firebase Auth user.
    """
    try:
        user = admin_auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
        )
        return user
    except Exception as e:
        raise Exception(f"Failed to create Firebase user: {e}")
