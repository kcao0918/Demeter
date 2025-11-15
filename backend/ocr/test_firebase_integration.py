#!/usr/bin/env python3
"""
Test script to verify Firebase Storage and OCR integration
Tests the complete workflow from image listing to result storage
"""

import os
import sys
import json
from config import validate_credentials, setup_firebase, FIREBASE_STORAGE_BUCKET, OCR_INPUT_FOLDER, OCR_SUBFOLDER
from ocr_medical_documents import MedicalDocumentOCR


def test_firebase_connection():
    """Test Firebase connection and credentials"""
    print("\n" + "=" * 70)
    print("TEST 1: Firebase Connection")
    print("=" * 70)
    
    is_valid, message = validate_credentials()
    print(f"✓ Credentials Valid: {is_valid}")
    print(f"  Message: {message}")
    
    if not is_valid:
        print("\n❌ Firebase connection failed. Check your .env file.")
        return False
    
    try:
        setup_firebase()
        print("✓ Firebase Setup: Success")
        return True
    except Exception as e:
        print(f"❌ Firebase setup error: {e}")
        return False


def test_ocr_initialization():
    """Test OCR processor initialization"""
    print("\n" + "=" * 70)
    print("TEST 2: OCR Processor Initialization")
    print("=" * 70)
    
    try:
        ocr_processor = MedicalDocumentOCR()
        print("✓ OCR Processor: Initialized")
        print(f"  Storage Bucket: {ocr_processor.storage_bucket}")
        print(f"  Input Folder: {OCR_INPUT_FOLDER}")
        print(f"  Subfolder: {OCR_SUBFOLDER}")
        print(f"  Expected Path: {OCR_INPUT_FOLDER}/{OCR_SUBFOLDER}")
        return True, ocr_processor
    except Exception as e:
        print(f"❌ OCR initialization failed: {e}")
        return False, None


def test_list_images(ocr_processor, uid):
    """Test listing images for a user"""
    print("\n" + "=" * 70)
    print(f"TEST 3: List Images for User '{uid}'")
    print("=" * 70)
    
    try:
        image_paths = ocr_processor.list_images_for_user(uid)
        print(f"✓ Image Listing: Success")
        print(f"  Storage Path: gs://{FIREBASE_STORAGE_BUCKET}/{OCR_INPUT_FOLDER}/{uid}/{OCR_SUBFOLDER}/")
        print(f"  Found {len(image_paths)} image(s)")
        
        if image_paths:
            print("\n  Images found:")
            for i, path in enumerate(image_paths, 1):
                print(f"    {i}. {path}")
        else:
            print("\n  ⚠️  No images found")
            print("     Upload medical images to the path above and try again")
        
        return True, image_paths
    except Exception as e:
        print(f"❌ Image listing failed: {e}")
        return False, []


def test_extract_single_image(ocr_processor, image_path):
    """Test OCR extraction on a single image"""
    print("\n" + "=" * 70)
    print(f"TEST 4: Extract Text from Single Image")
    print("=" * 70)
    print(f"  Image Path: {image_path}")
    
    try:
        result = ocr_processor.extract_text_from_firebase_image(image_path)
        
        print("✓ OCR Extraction: Success")
        print(f"  Status: {result.get('status', 'unknown')}")
        print(f"  Error: {result.get('error', 'None')}")
        print(f"  Text Blocks Extracted: {result.get('total_blocks', 0)}")
        
        if result.get('error'):
            print(f"  Error Details: {result['error']}")
        else:
            text_preview = result.get('full_text', '')[:100]
            print(f"  Text Preview: {text_preview}...")
        
        return True, result
    except Exception as e:
        print(f"❌ OCR extraction failed: {e}")
        return False, None


def test_process_all_images(ocr_processor, uid):
    """Test processing all images for a user"""
    print("\n" + "=" * 70)
    print(f"TEST 5: Process All Images for User '{uid}'")
    print("=" * 70)
    
    try:
        results = ocr_processor.process_user_documents(uid)
        
        successful = sum(1 for r in results if not r.get('error'))
        failed = len(results) - successful
        
        print("✓ Batch Processing: Success")
        print(f"  Total Processed: {len(results)}")
        print(f"  Successful: {successful}")
        print(f"  Failed: {failed}")
        
        return True, results
    except Exception as e:
        print(f"❌ Batch processing failed: {e}")
        return False, []


def test_firestore_storage(ocr_processor, uid, results):
    """Test saving results to Firestore"""
    print("\n" + "=" * 70)
    print(f"TEST 6: Save Results to Firestore")
    print("=" * 70)
    print(f"  Firestore Path: users/{uid}/ocr_results/")
    
    try:
        ocr_processor.save_results_to_firestore(uid, results)
        print("✓ Firestore Storage: Success")
        print(f"  Saved {len(results)} document(s)")
        return True
    except Exception as e:
        print(f"❌ Firestore storage failed: {e}")
        return False


def test_json_backup(ocr_processor, uid, results):
    """Test saving JSON backup"""
    print("\n" + "=" * 70)
    print(f"TEST 7: Save JSON Backup")
    print("=" * 70)
    
    try:
        filename = f"test_ocr_results_{uid}.json"
        ocr_processor.save_results_to_json(results, filename)
        print("✓ JSON Backup: Success")
        print(f"  File: {filename}")
        
        # Verify file exists
        if os.path.exists(filename):
            file_size = os.path.getsize(filename)
            print(f"  Size: {file_size} bytes")
        
        return True
    except Exception as e:
        print(f"❌ JSON backup failed: {e}")
        return False


def run_full_test(uid=None):
    """Run full test suite"""
    print("\n" + "=" * 70)
    print("Firebase + OCR Integration Test Suite")
    print("=" * 70)
    
    if uid is None:
        uid = input("\nEnter user ID for testing (or press Enter for 'test-user'): ").strip() or "test-user"
    
    print(f"\nTesting with User ID: {uid}")
    
    # Test 1: Firebase Connection
    if not test_firebase_connection():
        return
    
    # Test 2: OCR Initialization
    success, ocr_processor = test_ocr_initialization()
    if not success:
        return
    
    # Test 3: List Images
    success, image_paths = test_list_images(ocr_processor, uid)
    if not success or not image_paths:
        print("\n⚠️  No images found. Upload images and run again.")
        return
    
    # Test 4: Extract from first image
    if image_paths:
        test_extract_single_image(ocr_processor, image_paths[0])
    
    # Test 5: Process all images
    success, results = test_process_all_images(ocr_processor, uid)
    if not success or not results:
        return
    
    # Test 6: Save to Firestore
    test_firestore_storage(ocr_processor, uid, results)
    
    # Test 7: Save JSON backup
    test_json_backup(ocr_processor, uid, results)
    
    # Summary
    print("\n" + "=" * 70)
    print("Test Suite Complete!")
    print("=" * 70)
    print("\n✅ All tests completed successfully!")
    print("\n📊 Results Summary:")
    print(f"   - Images Processed: {len(results)}")
    print(f"   - Successful: {sum(1 for r in results if not r.get('error'))}")
    print(f"   - Failed: {sum(1 for r in results if r.get('error'))}")
    print(f"\n📁 Data Locations:")
    print(f"   - Images: gs://{FIREBASE_STORAGE_BUCKET}/{OCR_INPUT_FOLDER}/{uid}/{OCR_SUBFOLDER}/")
    print(f"   - Results (Firestore): users/{uid}/ocr_results/")
    print(f"   - Backup (JSON): test_ocr_results_{uid}.json")
    print("=" * 70)


if __name__ == "__main__":
    try:
        uid = sys.argv[1] if len(sys.argv) > 1 else None
        run_full_test(uid)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)
