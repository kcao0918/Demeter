#!/usr/bin/env python3
"""
Setup and credential validation script
This script helps you configure your Google Cloud credentials
"""

import os
import json
import sys
from pathlib import Path


def show_setup_instructions():
    """Display setup instructions"""
    print("\n" + "=" * 70)
    print("GOOGLE CLOUD SETUP INSTRUCTIONS")
    print("=" * 70)
    
    print("""
1. DOWNLOAD YOUR SERVICE KEY:
   - Go to Google Cloud Console: https://console.cloud.google.com
   - Navigate to: APIs & Services → Service Accounts
   - Click on your service account email
   - Click the "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose JSON format and download the file
   
2. SAVE THE KEY FILE:
   - Save the downloaded JSON file as 'service-account-key.json'
   - Place it in THIS directory (same folder as this script)
   
3. UPDATE CONFIGURATION:
   - Open config.py
   - Change GOOGLE_CLOUD_PROJECT to your project ID
   - Change GCS_BUCKET to your bucket name
   
4. RUN THE SCRIPT:
   - Run: python quickstart.py
   - The script will validate and connect automatically
""")


def verify_service_key():
    """Verify service key exists and is valid"""
    print("\n" + "=" * 70)
    print("VERIFYING SERVICE KEY")
    print("=" * 70)
    
    service_key_path = Path(__file__).parent / "service-account-key.json"
    
    print(f"\n🔍 Looking for service key at: {service_key_path}")
    
    if not service_key_path.exists():
        print("❌ Service key not found!")
        return False
    
    print("✅ Service key file found")
    
    try:
        with open(service_key_path, 'r') as f:
            key_data = json.load(f)
        
        print("\n📋 Service Key Details:")
        print(f"   - Type: {key_data.get('type', 'N/A')}")
        print(f"   - Project ID: {key_data.get('project_id', 'N/A')}")
        print(f"   - Service Account Email: {key_data.get('client_email', 'N/A')}")
        
        # Verify required fields
        required_fields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email']
        missing = [f for f in required_fields if f not in key_data]
        
        if missing:
            print(f"\n❌ Service key is missing fields: {', '.join(missing)}")
            return False
        
        print("\n✅ Service key is valid and complete!")
        return True
    
    except json.JSONDecodeError:
        print("❌ Service key JSON is invalid!")
        return False
    except Exception as e:
        print(f"❌ Error reading service key: {e}")
        return False


def verify_config():
    """Verify config.py is properly configured"""
    print("\n" + "=" * 70)
    print("VERIFYING CONFIGURATION")
    print("=" * 70)
    
    try:
        from config import GOOGLE_CLOUD_PROJECT, GCS_BUCKET, GCS_FOLDER
        
        print(f"\n📋 Current Configuration:")
        print(f"   - Project ID: {GOOGLE_CLOUD_PROJECT}")
        print(f"   - GCS Bucket: {GCS_BUCKET}")
        print(f"   - GCS Folder: {GCS_FOLDER}")
        
        needs_update = False
        
        if GOOGLE_CLOUD_PROJECT == "your-project-id":
            print("\n⚠️  Project ID needs to be updated")
            needs_update = True
        
        if GCS_BUCKET == "your-bucket-name":
            print("⚠️  GCS Bucket name needs to be updated")
            needs_update = True
        
        if needs_update:
            print("\n❌ Configuration needs to be updated in config.py")
            return False
        
        print("\n✅ Configuration looks good!")
        return True
    
    except Exception as e:
        print(f"❌ Error reading config: {e}")
        return False


def test_connection():
    """Test connection to Google Cloud"""
    print("\n" + "=" * 70)
    print("TESTING CONNECTION TO GOOGLE CLOUD")
    print("=" * 70)
    
    try:
        print("\n🔄 Initializing Google Cloud clients...")
        
        from config import setup_environment
        setup_environment()
        
        from google.cloud import storage, vision_v1
        
        print("✅ Google Cloud libraries imported successfully")
        
        # Test storage client
        print("🔄 Testing Storage connection...")
        storage_client = storage.Client()
        print(f"✅ Storage client connected (Project: {storage_client.project})")
        
        # Test vision client
        print("🔄 Testing Vision API connection...")
        vision_client = vision_v1.ImageAnnotatorClient()
        print("✅ Vision API client connected")
        
        return True
    
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\nTroubleshooting steps:")
        print("   1. Verify service key JSON is valid")
        print("   2. Check that Vision API is enabled in Google Cloud Console")
        print("   3. Ensure service account has required permissions")
        return False


def main():
    print("\n" + "=" * 70)
    print("GOOGLE CLOUD CREDENTIAL SETUP")
    print("=" * 70)
    
    show_setup_instructions()
    
    # Step 1: Verify service key
    if not verify_service_key():
        print("\n⚠️  Please download and save your service key (see instructions above)")
        sys.exit(1)
    
    # Step 2: Verify config
    if not verify_config():
        print("\n⚠️  Please update config.py with your Project ID and Bucket name")
        sys.exit(1)
    
    # Step 3: Test connection
    if not test_connection():
        print("\n❌ Connection test failed")
        print("Please check the error messages above and try again")
        sys.exit(1)
    
    print("\n" + "=" * 70)
    print("✅ ALL CHECKS PASSED!")
    print("=" * 70)
    print("\nYou're ready to run: python quickstart.py")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()
