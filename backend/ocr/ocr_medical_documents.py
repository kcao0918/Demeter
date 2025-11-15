"""
Google Vertex AI OCR API for Medical Document Processing
This script uses Vertex AI Vision API to extract text from medical documents
stored in Firebase Storage under users/$uid/images structure.
"""

from google.cloud import vision_v1
import firebase_admin
from firebase_admin import credentials, storage, firestore
import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from config import (
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_SERVICE_KEY_JSON,
    OCR_INPUT_FOLDER,
    OCR_SUBFOLDER,
    validate_credentials,
    setup_firebase
)


class MedicalDocumentOCR:
    """Extract text from medical documents using Vertex AI OCR and Firebase Storage.
    
    Images are expected to be stored in: gs://bucket/users/{uid}/images/
    OCR results are saved to: Firestore at users/{uid}/ocr_results/
    """
    
    def __init__(self):
        """
        Initialize the OCR processor with Firebase credentials
        """
        # Validate and setup Firebase
        is_valid, message = validate_credentials()
        if not is_valid:
            raise ValueError(f"Firebase configuration error: {message}")
        
        # Initialize Firebase
        try:
            app = firebase_admin.get_app()
        except ValueError:
            # No app initialized yet
            creds_dict = json.loads(FIREBASE_SERVICE_KEY_JSON)
            cred = credentials.Certificate(creds_dict)
            app = firebase_admin.initialize_app(cred, {
                "storageBucket": FIREBASE_STORAGE_BUCKET
            })
        
        self.bucket = storage.bucket()
        self.db = firestore.client()
        self.vision_client = vision_v1.ImageAnnotatorClient()
        self.storage_bucket = FIREBASE_STORAGE_BUCKET
    
    def list_images_for_user(self, uid: str, subfolder: str = OCR_SUBFOLDER) -> List[str]:
        """
        List all image files for a specific user in Firebase Storage.
        Path structure: users/{uid}/images/
        
        Args:
            uid: User ID
            subfolder: Subfolder within user's directory (default: "images")
        
        Returns:
            List of blob paths for images (full paths like users/{uid}/images/file.jpg)
        """
        user_path = f"{OCR_INPUT_FOLDER}/{uid}/{subfolder}"
        blobs = self.bucket.list_blobs(prefix=user_path)
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.pdf', '.tiff', '.gif'}
        image_blobs = []
        
        for blob in blobs:
            file_ext = os.path.splitext(blob.name)[1].lower()
            if file_ext in image_extensions and not blob.name.endswith('/'):
                image_blobs.append(blob.name)
        
        return image_blobs
    
    def extract_text_from_firebase_image(self, file_path: str) -> Dict[str, Any]:
        """
        Extract text from a single image in Firebase Storage using Vertex AI Vision API.
        
        Args:
            file_path: Full path to image in Firebase Storage (e.g., "users/uid123/images/doc.jpg")
        
        Returns:
            Dictionary containing extracted text and metadata
        """
        try:
            # Build the GCS URI
            gcs_uri = f"gs://{self.storage_bucket}/{file_path}"
            
            # Create image source from GCS
            image_source = vision_v1.ImageSource(gcs_image_uri=gcs_uri)
            image = vision_v1.Image(source=image_source)
            
            # Call the Vertex AI Vision API for text detection
            response = self.vision_client.text_detection(image=image)
            
            # Extract text annotations
            texts = response.text_annotations
            full_text = texts[0].description if texts else ""
            
            # Extract individual text blocks with confidence scores
            text_blocks = []
            for text in texts[1:]:  # Skip the first entry (full text)
                text_blocks.append({
                    "text": text.description,
                    "confidence": text.confidence if hasattr(text, 'confidence') else 0.0
                })
            
            result = {
                "file_path": file_path,
                "gcs_uri": gcs_uri,
                "full_text": full_text,
                "text_blocks": text_blocks,
                "total_blocks": len(text_blocks),
                "error": None,
                "timestamp": datetime.now().isoformat(),
                "status": "success"
            }
            
            return result
            
        except Exception as e:
            return {
                "file_path": file_path,
                "gcs_uri": f"gs://{self.storage_bucket}/{file_path}",
                "full_text": "",
                "text_blocks": [],
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "status": "failed"
            }
    
    def process_user_documents(self, uid: str, subfolder: str = OCR_SUBFOLDER) -> List[Dict[str, Any]]:
        """
        Process all medical documents for a specific user
        
        Args:
            uid: User ID
            subfolder: Subfolder within user's directory (default: "images")
        
        Returns:
            List of results for each processed document
        """
        image_paths = self.list_images_for_user(uid, subfolder)
        
        if not image_paths:
            print(f"No images found for user {uid} in {OCR_INPUT_FOLDER}/{uid}/{subfolder}")
            return []
        
        print(f"Found {len(image_paths)} image(s) to process for user {uid}")
        results = []
        
        for i, image_path in enumerate(image_paths, 1):
            print(f"Processing {i}/{len(image_paths)}: {image_path}")
            result = self.extract_text_from_firebase_image(image_path)
            results.append(result)
            
            if result["error"]:
                print(f"  Error: {result['error']}")
            else:
                print(f"  Successfully extracted {result['total_blocks']} text blocks")
        
        return results
    
    def save_results_to_firestore(self, uid: str, results: List[Dict[str, Any]], collection_name: str = "ocr_results") -> None:
        """
        Save OCR results to Firestore under users/{uid}/ocr_results collection.
        Each result document contains the extracted text and metadata.
        
        Args:
            uid: User ID
            results: List of OCR results
            collection_name: Name of the subcollection (default: "ocr_results")
        """
        if not results:
            print(f"No results to save for user {uid}")
            return
        
        batch = self.db.batch()
        
        for result in results:
            # Create a document for each OCR result
            # Use the filename as the document ID for easy reference
            filename = os.path.basename(result["file_path"])
            doc_ref = self.db.collection("users").document(uid).collection(collection_name).document(filename)
            
            batch.set(doc_ref, {
                **result,
                "stored_at": firestore.SERVER_TIMESTAMP,
                "status": "completed" if not result["error"] else "failed",
                "uid": uid
            })
        
        # Commit batch
        batch.commit()
        print(f"✅ Saved {len(results)} OCR results to Firestore at users/{uid}/ocr_results/")
    
    def save_results_to_json(self, results: List[Dict[str, Any]], output_path: str = "ocr_results.json") -> None:
        """
        Save OCR results to a JSON file (local backup)
        
        Args:
            results: List of OCR results
            output_path: Path to save the JSON file
        """
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"✅ Results saved to {output_path}")


def main():
    """Main function to run the OCR processing"""
    
    # Setup Firebase
    setup_firebase()
    
    # Initialize OCR processor
    ocr_processor = MedicalDocumentOCR()
    
    # Example: Process documents for a user
    # Replace 'user123' with an actual user ID
    uid = os.getenv("USER_ID", "user123")
    
    print(f"\n🔄 Processing OCR for user: {uid}")
    
    # Process all documents for the user
    results = ocr_processor.process_user_documents(uid)
    
    if results:
        # Save results to Firestore (primary storage)
        ocr_processor.save_results_to_firestore(uid, results)
        
        # Save results locally (optional backup)
        ocr_processor.save_results_to_json(results)
        
        # Print summary
        print("\n=== OCR Processing Summary ===")
        successful = sum(1 for r in results if not r["error"])
        failed = len(results) - successful
        print(f"Successful: {successful}/{len(results)}")
        print(f"Failed: {failed}/{len(results)}")
    else:
        print("No documents to process.")


if __name__ == "__main__":
    main()
