"""
Configuration file for Google Cloud credentials and GCS settings
Update this file with your actual values
"""

import os
import json
from pathlib import Path

# Path to your service account key JSON file
# Place your downloaded service-account-key.json in the project root
SERVICE_KEY_PATH = os.path.join(
    os.path.dirname(__file__),
    "service-account-key.json"
)

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT = "patient67"  # Update this
GCS_BUCKET = "patient47"  # Update this
GCS_FOLDER = "users/images"  # Path to your medical documents (inside the bucket)

# Validate configuration
def validate_credentials():
    """
    Validate that service key exists and credentials are properly configured
    
    Returns:
        Tuple: (is_valid, message)
    """
    # Check if service key exists
    if not os.path.exists(SERVICE_KEY_PATH):
        return False, f"Service key not found at {SERVICE_KEY_PATH}\nDownload your service key and save it as 'service-account-key.json' in the project root."
    
    # Try to load the service key to validate JSON
    try:
        with open(SERVICE_KEY_PATH, 'r') as f:
            key_data = json.load(f)
        
        # Verify key has required fields
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in key_data]
        
        if missing_fields:
            return False, f"Service key is missing fields: {', '.join(missing_fields)}"
        
        return True, "Service key is valid"
    
    except json.JSONDecodeError:
        return False, "Service key JSON is invalid. Make sure you downloaded the correct file."
    except Exception as e:
        return False, f"Error validating service key: {str(e)}"

def setup_environment():
    """
    Set up environment variables for Google Cloud authentication
    Call this function at the start of your script
    """
    # Set the service account key path as environment variable
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = SERVICE_KEY_PATH
    
    # Set project ID
    os.environ["GOOGLE_CLOUD_PROJECT"] = GOOGLE_CLOUD_PROJECT
    
    print(f"✅ Environment configured:")
    print(f"   - Credentials: {SERVICE_KEY_PATH}")
    print(f"   - Project ID: {GOOGLE_CLOUD_PROJECT}")
    print(f"   - GCS Bucket: {GCS_BUCKET}")

if __name__ == "__main__":
    is_valid, message = validate_credentials()
    print(message)
    if is_valid:
        print("\n✅ Configuration is valid!")
    else:
        print("\n❌ Configuration issue detected!")
