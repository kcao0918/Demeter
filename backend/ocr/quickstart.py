#!/usr/bin/env python3
"""
Quick-start script for Medical Document OCR with Google Vertex AI
Run this script to set up and process medical documents
"""

import os
import sys
from config import validate_credentials, setup_environment, GOOGLE_CLOUD_PROJECT, GCS_BUCKET, GCS_FOLDER
from ocr_medical_documents import MedicalDocumentOCR
from ocr_analysis import MedicalOCRAnalyzer


def main():
    print("=" * 60)
    print("Medical Document OCR - Google Vertex AI")
    print("=" * 60)
    
    # Validate and setup credentials
    print("\n🔐 Validating credentials...")
    is_valid, message = validate_credentials()
    print(f"   {message}")
    
    if not is_valid:
        print("\n❌ Please follow these steps:")
        print("   1. Download your service account key from Google Cloud Console")
        print("   2. Save it as 'service-account-key.json' in this directory")
        print("   3. Update GOOGLE_CLOUD_PROJECT and GCS_BUCKET in config.py")
        sys.exit(1)
    
    # Setup environment
    setup_environment()
    
    # Get configuration
    project_id = GOOGLE_CLOUD_PROJECT
    gcs_bucket = GCS_BUCKET
    gcs_folder = GCS_FOLDER
    
    print(f"\n✅ Configuration:")
    print(f"   Project ID: {project_id}")
    print(f"   GCS Bucket: {gcs_bucket}")
    print(f"   GCS Folder: {gcs_folder}")
    
    # Initialize OCR processor
    print(f"\n🔄 Initializing OCR processor...")
    try:
        ocr_processor = MedicalDocumentOCR(
            project_id=project_id,
            gcs_bucket=gcs_bucket,
            gcs_folder=gcs_folder
        )
    except Exception as e:
        print(f"❌ Error initializing OCR processor: {e}")
        print("   Make sure credentials are properly configured")
        sys.exit(1)
    
    # List available images
    print(f"\n📋 Scanning GCS folder for images...")
    image_paths = ocr_processor.list_images_in_gcs_folder()
    
    if not image_paths:
        print(f"❌ No images found in gs://{gcs_bucket}/{gcs_folder}")
        print("   Upload medical documents to the GCS folder and try again")
        sys.exit(1)
    
    print(f"✅ Found {len(image_paths)} image(s)")
    for path in image_paths[:5]:  # Show first 5
        print(f"   - {path}")
    if len(image_paths) > 5:
        print(f"   ... and {len(image_paths) - 5} more")
    
    # Process documents
    print(f"\n🔍 Processing medical documents with OCR...")
    print("   (This may take a few minutes depending on the number of documents)")
    
    results = ocr_processor.process_all_documents()
    
    # Save results
    print(f"\n💾 Saving results...")
    ocr_processor.save_results_to_json(results)
    
    # Optional: Save to GCS
    save_to_gcs = input("Save results to GCS? (y/n): ").lower() == 'y'
    if save_to_gcs:
        ocr_processor.save_results_to_gcs(results, f"{gcs_folder}/ocr_results.json")
    
    # Generate analysis report
    print(f"\n📊 Generating analysis report...")
    analyzer = MedicalOCRAnalyzer()
    report = analyzer.generate_report(results)
    analyzer.export_report_to_json(report)
    
    # Print summary
    print("\n" + "=" * 60)
    print("Processing Complete!")
    print("=" * 60)
    print(f"✅ Successful: {report['summary']['successful']}/{report['summary']['total_documents']}")
    print(f"❌ Failed: {report['summary']['failed']}/{report['summary']['total_documents']}")
    print(f"📊 Success Rate: {report['summary']['success_rate']:.1f}%")
    print(f"📈 Average Confidence: {report['text_metrics']['average_confidence']:.2%}")
    print(f"\n📁 Output files:")
    print(f"   - ocr_results.json (detailed results)")
    print(f"   - ocr_report.json (analysis report)")
    print("=" * 60)


if __name__ == "__main__":
    main()
