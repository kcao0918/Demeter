# Medical Document OCR with Google Vertex AI

This project uses Google Cloud Vision API to extract text from medical documents stored in Google Cloud Storage (GCS).

## Prerequisites

- Google Cloud Project with Vision API enabled
- Service account with appropriate permissions
- Python 3.7+
- GCS bucket with medical documents

## Setup Instructions

### 1. Enable Google Cloud APIs

```bash
# Enable the Vision API
gcloud services enable vision.googleapis.com

# Enable the Storage API
gcloud services enable storage.googleapis.com
```

### 2. Create Service Account and Download Credentials

```bash
# Create a service account
gcloud iam service-accounts create medical-ocr \
    --display-name="Medical Document OCR Service"

# Grant necessary permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:medical-ocr@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/vision.viewer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:medical-ocr@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

# Create and download key
gcloud iam service-accounts keys create ./service-account-key.json \
    --iam-account=medical-ocr@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 3. Set Up Environment

```bash
# Install dependencies
pip install -r requirements.txt

# Set authentication
export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GCS_BUCKET="your-bucket-name"
```

### 4. Upload Medical Documents to GCS

```bash
# Create the folder structure in GCS
gsutil -m cp local_documents/* gs://your-bucket-name/patient47/users/images/
```

### 5. Run the OCR Processing

```bash
python ocr_medical_documents.py
```

## Configuration

Update the following in `ocr_medical_documents.py`:

- `PROJECT_ID`: Your Google Cloud Project ID
- `GCS_BUCKET`: Your GCS bucket name
- `GCS_FOLDER`: Path to your medical documents (default: "patient47/users/images")

## Output

The script generates `ocr_results.json` containing:

```json
[
  {
    "file_path": "patient47/users/images/document.jpg",
    "full_text": "Extracted text content...",
    "text_blocks": [
      {
        "text": "Block text",
        "confidence": 0.95,
        "bounding_box": [{"x": 0, "y": 0}, ...]
      }
    ],
    "total_blocks": 15,
    "error": null,
    "timestamp": "2025-11-14T10:30:00"
  }
]
```

## Features

- **Batch Processing**: Process multiple medical documents at once
- **Confidence Scores**: Get OCR confidence for each text block
- **Bounding Boxes**: Extract coordinates of detected text regions
- **Error Handling**: Detailed error messages for failed documents
- **GCS Integration**: Seamlessly read from and write to Cloud Storage
- **JSON Export**: Save results in structured JSON format

## Supported File Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- PDF (.pdf)
- TIFF (.tiff)
- GIF (.gif)

## Troubleshooting

### Authentication Error
Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="./service-account-key.json"
```

### API Not Enabled
Make sure Vision API is enabled in your Google Cloud project:
```bash
gcloud services enable vision.googleapis.com
```

### Permission Denied
Verify service account has appropriate IAM roles:
- `roles/vision.viewer`
- `roles/storage.objectViewer`

## API Reference

### MedicalDocumentOCR Class

- `__init__(project_id, gcs_bucket, gcs_folder)`: Initialize OCR processor
- `list_images_in_gcs_folder()`: List all processable images in GCS folder
- `extract_text_from_gcs_image(gcs_path)`: Extract text from a single image
- `process_all_documents()`: Process all documents in the folder
- `save_results_to_json(results, output_path)`: Save results locally
- `save_results_to_gcs(results, output_blob_name)`: Save results to GCS

## Example Usage

```python
from ocr_medical_documents import MedicalDocumentOCR

# Initialize processor
ocr = MedicalDocumentOCR(
    project_id="my-project",
    gcs_bucket="my-bucket",
    gcs_folder="patient47/users/images"
)

# Process documents
results = ocr.process_all_documents()

# Save results
ocr.save_results_to_json(results)
ocr.save_results_to_gcs(results)
```

## Notes

- The Vision API charges per image processed. Check pricing: https://cloud.google.com/vision/pricing
- PDFs are billed per page
- Consider implementing caching to avoid reprocessing documents
