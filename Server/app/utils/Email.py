# app/utils/gmail.py
import os
import base64
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# ================= CONFIG =================
APPNAME = os.getenv("APPNAME")
GMAIL_CLIENT_ID = os.getenv("GMAIL_CLIENT_ID")
GMAIL_CLIENT_SECRET = os.getenv("GMAIL_CLIENT_SECRET")
GMAIL_REFRESH_TOKEN = os.getenv("GMAIL_REFRESH_TOKEN")
GMAIL_SENDER_EMAIL = os.getenv("GMAIL_SENDER_EMAIL")
REDIRECT_URI = os.getenv("REDIRECT_URI", "https://developers.google.com/oauthplayground")

# Setup logging (beautiful terminal output)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# ==========================================
# OAuth2 + Gmail Service
# ==========================================
def get_gmail_service():
    creds = Credentials(
        token=None,
        refresh_token=GMAIL_REFRESH_TOKEN,
        client_id=GMAIL_CLIENT_ID,
        client_secret=GMAIL_CLIENT_SECRET,
        token_uri="https://oauth2.googleapis.com/token",
        scopes=["https://www.googleapis.com/auth/gmail.send"]
    )

    if not creds.valid:
        try:
            creds.refresh(Request())
            logger.info("Gmail access token refreshed")
        except Exception as e:
            logger.error(f"Failed to refresh Gmail token: {e}")
            raise

    return build("gmail", "v1", credentials=creds)

# ==========================================
# Encode Email (Node.js Buffer Equivalent)
# ==========================================
def make_email(to: str, subject: str, html: str) -> str:
    message = [
        f"From: {APPNAME} <{GMAIL_SENDER_EMAIL}>",
        f"To: {to}",
        f"Subject: {subject}",
        "Content-Type: text/html; charset=UTF-8",
        "MIME-Version: 1.0",
        "",
        html
    ]
    raw = "\n".join(message)
    encoded = base64.urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8")
    return encoded.rstrip("=")

# ==========================================
# MAIN SENDER FUNCTION (as you requested)
# ==========================================
async def sender(to: str, subject: str, html: str):
    if not all([to, subject, html]):
        error = "to, subject, html are required"
        logger.error(f"Sender failed → {error}")
        raise ValueError(error)

    try:
        service = get_gmail_service()
        raw_message = make_email(to, subject, html)

        result = service.users().messages().send(
            userId="me",
            body={"raw": raw_message}
        ).execute()

        msg_id = result["id"]
        logger.info(f"Email sent → MessageId = {msg_id} | To: {to} | Subject: {subject}")
        return result

    except Exception as err:
        error_msg = getattr(err, 'message', str(err))
        logger.error(f"Sender failed → To: {to} | Error: {error_msg}")
        raise err