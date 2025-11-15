"""
Google Vertex AI OCR API for Medical Document Processing
This script uses the Vertex AI Document AI to extract text from medical documents
stored in Google Cloud Storage (GCS).
"""

from google.cloud import vision_v1
from google.cloud import storage
import os
import json
from typing import List, Dict, Any
from datetime import datetime


class MedicalDocumentOCR:
    """Extract text from medical documents using Vertex AI OCR"""
    
    def __init__(self, project_id: str, gcs_bucket: str, gcs_folder: str):
        """
        Initialize the OCR processor
        
        Args:
            project_id: Google Cloud Project ID
            gcs_bucket: GCS bucket name
            gcs_folder: Path to folder in GCS (e.g., "patient47/users/images")
        """
        self.project_id = project_id
        self.gcs_bucket = gcs_bucket
        self.gcs_folder = gcs_folder
        self.vision_client = vision_v1.ImageAnnotatorClient()
        self.storage_client = storage.Client()
        self.bucket = self.storage_client.bucket(gcs_bucket)
    
    def list_images_in_gcs_folder(self) -> List[str]:
        """
        List all image files in the specified GCS folder
        
        Returns:
            List of blob names (full paths) in the GCS folder
        """
        blobs = self.storage_client.list_blobs(
            self.gcs_bucket,
            prefix=self.gcs_folder
        )
        
        image_extensions = {'.jpg', '.jpeg', '.png', '.pdf', '.tiff', '.gif'}
        image_blobs = []
        
        for blob in blobs:
            file_ext = os.path.splitext(blob.name)[1].lower()
            if file_ext in image_extensions:
                image_blobs.append(blob.name)
        
        return image_blobs
    
    def extract_text_from_gcs_image(self, gcs_path: str) -> Dict[str, Any]:
        """
        Extract text from a single image in GCS using OCR
        
        Args:
            gcs_path: Full path to image in GCS (e.g., "patient47/users/images/doc.jpg")
        
        Returns:
            Dictionary containing extracted text and metadata
        """
        image_source = vision_v1.ImageSource(
            gcs_image_uri=f"gs://{self.gcs_bucket}/{gcs_path}"
        )
        image = vision_v1.Image(source=image_source)
        
        try:
            # Call the Vertex AI Vision API
            response = self.vision_client.text_detection(image=image)
            
            # Extract text annotations
            texts = response.text_annotations
            full_text = texts[0].description if texts else ""
            
            # Extract individual text blocks with confidence scores
            text_blocks = []
            for text in texts[1:]:  # Skip the first entry (full text)
                text_blocks.append(text.description)
            
            result = {
                "file_path": gcs_path,
                "full_text": full_text,
                "text_blocks": text_blocks,
                "total_blocks": len(text_blocks),
                "error": None,
                "timestamp": datetime.now().isoformat()
            }
            
            return result
        
            
        except Exception as e:
            return {
                "file_path": gcs_path,
                "full_text": "",
                "text_blocks": [],
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_bounding_box(self, bounding_poly) -> List[Dict[str, int]]:
        """Extract bounding box coordinates from polygon"""
        if not bounding_poly or not bounding_poly.vertices:
            return []
        
        return [
            {"x": vertex.x, "y": vertex.y}
            for vertex in bounding_poly.vertices
        ]
    
    def process_all_documents(self) -> List[Dict[str, Any]]:
        """
        Process all medical documents in the GCS folder
        
        Returns:
            List of results for each processed document
        """
        image_paths = self.list_images_in_gcs_folder()
        
        if not image_paths:
            print(f"No images found in gs://{self.gcs_bucket}/{self.gcs_folder}")
            return []
        
        print(f"Found {len(image_paths)} image(s) to process")
        results = []
        
        for i, image_path in enumerate(image_paths, 1):
            print(f"Processing {i}/{len(image_paths)}: {image_path}")
            result = self.extract_text_from_gcs_image(image_path)
            results.append(result)
            
            if result["error"]:
                print(f"  Error: {result['error']}")
            else:
                print(f"  Successfully extracted {result['total_blocks']} text blocks")
        
        return results
    
    def save_results_to_json(self, results: List[Dict[str, Any]], output_path: str = "ocr_results.json") -> None:
        """
        Save OCR results to a JSON file
        
        Args:
            results: List of OCR results
            output_path: Path to save the JSON file
        """
        with open(output_path, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"Results saved to {output_path}")
    
    def save_results_to_gcs(self, results: List[Dict[str, Any]], output_blob_name: str = "ocr_results.json") -> None:
        """
        Save OCR results to GCS
        
        Args:
            results: List of OCR results
            output_blob_name: Name of the blob in GCS
        """
        blob = self.bucket.blob(output_blob_name)
        blob.upload_from_string(
            json.dumps(results, indent=2),
            content_type="application/json"
        )
        
        print(f"Results saved to gs://{self.gcs_bucket}/{output_blob_name}")


def main():
    """Main function to run the OCR processing"""
    
    # Configuration - Update these with your actual values
    PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
    GCS_BUCKET = os.getenv("GCS_BUCKET", "your-bucket-name")
    GCS_FOLDER = "patient47/users/images"
    
    # Initialize OCR processor
    ocr_processor = MedicalDocumentOCR(
        project_id=PROJECT_ID,
        gcs_bucket=GCS_BUCKET,
        gcs_folder=GCS_FOLDER
    )
    
    # Process all documents
    results = ocr_processor.process_all_documents()
    
    if results:
        # Save results locally
        ocr_processor.save_results_to_json(results)
        
        # Optionally save to GCS
        # ocr_processor.save_results_to_gcs(results, "medical_docs/ocr_results.json")
        
        # Print summary
        print("\n=== OCR Processing Summary ===")
        successful = sum(1 for r in results if not r["error"])
        failed = len(results) - successful
        print(f"Successful: {successful}/{len(results)}")
        print(f"Failed: {failed}/{len(results)}")


if __name__ == "__main__":
    main()
