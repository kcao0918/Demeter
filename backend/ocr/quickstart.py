#!/usr/bin/env python3
"""
Quick-start script for Medical Document OCR with Firebase Storage and Google Vertex AI
Processes medical documents stored in Firebase Storage at users/{uid}/images/
and saves OCR results to Firestore at users/{uid}/ocr_results/
"""

import os
import sys
from config import validate_credentials, setup_firebase, FIREBASE_STORAGE_BUCKET, OCR_INPUT_FOLDER, OCR_SUBFOLDER
from ocr_medical_documents import MedicalDocumentOCR
from ocr_analysis import MedicalOCRAnalyzer


def main():
    print("=" * 70)
    print("Medical Document OCR - Firebase Storage + Google Vertex AI")
    print("=" * 70)
    
    # Validate Firebase credentials
    print("\n🔐 Validating Firebase credentials...")
    is_valid, message = validate_credentials()
    print(f"   {message}")
    
    if not is_valid:
        print("\n❌ Please follow these steps:")
        print("   1. Download your Firebase service account key from Firebase Console")
        print("   2. Add it to your .env file as FIREBASE_SERVICE_KEY")
        print("   3. Set FIREBASE_PROJECT_ID and FIREBASE_STORAGE_BUCKET in .env")
        sys.exit(1)
    
    # Setup Firebase
    print("\n🔄 Setting up Firebase...")
    try:
        setup_firebase()
    except Exception as e:
        print(f"❌ Firebase setup error: {e}")
        sys.exit(1)
    
    # Initialize OCR processor
    print(f"\n🔄 Initializing OCR processor...")
    try:
        ocr_processor = MedicalDocumentOCR()
    except Exception as e:
        print(f"❌ Error initializing OCR processor: {e}")
        print("   Make sure Firebase credentials are properly configured")
        sys.exit(1)
    
    # Get user ID
    print(f"\n👤 Enter user ID to process OCR for (or press Enter for 'demo-user'):")
    uid = input("   User ID: ").strip() or "demo-user"
    
    # List available images for the user
    print(f"\n📋 Scanning Firebase Storage for images...")
    print(f"   Path: {OCR_INPUT_FOLDER}/{uid}/{OCR_SUBFOLDER}/")
    image_paths = ocr_processor.list_images_for_user(uid)
    
    if not image_paths:
        print(f"❌ No images found in gs://{FIREBASE_STORAGE_BUCKET}/{OCR_INPUT_FOLDER}/{uid}/{OCR_SUBFOLDER}/")
        print("   Please upload medical documents to this path and try again")
        sys.exit(1)
    
    print(f"✅ Found {len(image_paths)} image(s) to process")
    for i, path in enumerate(image_paths[:5], 1):
        print(f"   {i}. {path}")
    if len(image_paths) > 5:
        print(f"   ... and {len(image_paths) - 5} more")
    
    # Confirm processing
    confirm = input(f"\n🚀 Process {len(image_paths)} document(s)? (y/n): ").lower()
    if confirm != 'y':
        print("   Cancelled.")
        sys.exit(0)
    
    # Process documents
    print(f"\n🔍 Processing medical documents with OCR...")
    print("   (This may take a few minutes depending on the number of documents)")
    
    results = ocr_processor.process_user_documents(uid)
    
    if not results:
        print("❌ No results to save")
        sys.exit(1)
    
    # Save results to Firestore (primary storage)
    print(f"\n💾 Saving results to Firestore...")
    try:
        ocr_processor.save_results_to_firestore(uid, results)
        print(f"   ✅ Results saved to users/{uid}/ocr_results/")
    except Exception as e:
        print(f"❌ Error saving to Firestore: {e}")
    
    # Save results to JSON file locally (backup)
    print(f"\n💾 Saving local backup...")
    try:
        ocr_processor.save_results_to_json(results, f"ocr_results_{uid}.json")
        print(f"   ✅ Backup saved to ocr_results_{uid}.json")
    except Exception as e:
        print(f"❌ Error saving JSON backup: {e}")
    
    # Generate analysis report
    print(f"\n📊 Generating analysis report...")
    try:
        analyzer = MedicalOCRAnalyzer()
        report = analyzer.generate_report(results)
        analyzer.export_report_to_json(f"ocr_report_{uid}.json", report)
    except Exception as e:
        print(f"⚠️  Error generating report: {e}")
        report = None
    
    # Print summary
    print("\n" + "=" * 70)
    print("🎉 Processing Complete!")
    print("=" * 70)
    
    successful = sum(1 for r in results if not r.get("error"))
    failed = len(results) - successful
    success_rate = (successful / len(results) * 100) if results else 0
    
    print(f"✅ Successful: {successful}/{len(results)}")
    print(f"❌ Failed: {failed}/{len(results)}")
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    if report:
        print(f"📈 Average Confidence: {report.get('text_metrics', {}).get('average_confidence', 0):.2%}")
    
    print(f"\n📁 Output:")
    print(f"   - Firestore: users/{uid}/ocr_results/ (primary)")
    print(f"   - JSON Backup: ocr_results_{uid}.json")
    print(f"   - Report: ocr_report_{uid}.json")
    print("=" * 70)


if __name__ == "__main__":
    main()
