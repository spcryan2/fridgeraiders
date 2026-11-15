import os
import secrets

from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-flash-latest")
MOCK_GEMINI = os.getenv("MOCK_GEMINI") == "1"
# signs the login cookie. Without it in .env, everyone is logged out when Flask restarts
SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_hex(32)