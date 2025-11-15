"""
Configuration file for Firebase credentials and storage settings
Uses Firebase credentials from environment variables (.env file)
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Firebase Configuration (loaded from .env)
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "patient67")
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "patient67.firebasestorage.app")
FIREBASE_SERVICE_KEY_JSON = os.getenv("FIREBASE_SERVICE_KEY")

# OCR Configuration
# Complete Firebase Storage path: gs://bucket/users/{uid}/images/
OCR_INPUT_FOLDER = "users"  # Root folder containing user directories
OCR_SUBFOLDER = "images"    # Subfolder within user's directory where images are stored
# Images are expected at: {OCR_INPUT_FOLDER}/{uid}/{OCR_SUBFOLDER}/ => users/{uid}/images/
# OCR results are saved to Firestore at: users/{uid}/ocr_results/

# Validate Firebase credentials
def validate_credentials():
    """
    Validate that Firebase credentials are properly configured
    
    Returns:
        Tuple: (is_valid, message)
    """
    # Check if Firebase service key JSON is available
    if not FIREBASE_SERVICE_KEY_JSON:
        return False, "FIREBASE_SERVICE_KEY not found in environment variables. Check your .env file."
    
    # Try to parse the Firebase service key
    try:
        key_data = json.loads(FIREBASE_SERVICE_KEY_JSON)
        
        # Verify key has required fields
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in key_data]
        
        if missing_fields:
            return False, f"Firebase service key is missing fields: {', '.join(missing_fields)}"
        
        return True, "Firebase credentials are valid"
    
    except json.JSONDecodeError:
        return False, "FIREBASE_SERVICE_KEY JSON is invalid. Check your .env file."
    except Exception as e:
        return False, f"Error validating Firebase credentials: {str(e)}"

def setup_firebase():
    """
    Set up Firebase authentication
    Call this function at the start of your script
    
    Returns:
        dict: Parsed Firebase credentials
    """
    if not FIREBASE_SERVICE_KEY_JSON:
        raise ValueError("FIREBASE_SERVICE_KEY not found in environment. Check your .env file.")
    
    try:
        credentials = json.loads(FIREBASE_SERVICE_KEY_JSON)
        print(f"✅ Firebase environment configured:")
        print(f"   - Project ID: {FIREBASE_PROJECT_ID}")
        print(f"   - Storage Bucket: {FIREBASE_STORAGE_BUCKET}")
        print(f"   - Input Folder: {OCR_INPUT_FOLDER}")
        return credentials
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse FIREBASE_SERVICE_KEY: {str(e)}")

if __name__ == "__main__":
    is_valid, message = validate_credentials()
    print(message)
    if is_valid:
        print("\n✅ Configuration is valid!")
    else:
        print("\n❌ Configuration issue detected!")
