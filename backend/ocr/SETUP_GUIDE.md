# Google Cloud Connection Setup Guide

## Quick Connection Steps

### 1️⃣ **Save Your Service Key**
```bash
# Move your downloaded service-account-key.json to the project root
cp ~/Downloads/service-account-key.json ./service-account-key.json
```

### 2️⃣ **Update config.py**
Open `config.py` and update these values:

```python
GOOGLE_CLOUD_PROJECT = "your-actual-project-id"  # e.g., "my-project-123"
GCS_BUCKET = "your-actual-bucket-name"           # e.g., "my-medical-docs"
GCS_FOLDER = "patient47/users/images"            # Already set correctly
```

To find your project ID and bucket name:
- **Project ID**: Go to https://console.cloud.google.com → look at the top header
- **Bucket Name**: Go to Cloud Storage → see your bucket names

### 3️⃣ **Verify Setup**
```bash
python setup_credentials.py
```

This will:
- ✅ Check if service key exists
- ✅ Validate service key format
- ✅ Verify config.py settings
- ✅ Test connection to Google Cloud

### 4️⃣ **Run OCR Processing**
```bash
python quickstart.py
```

---

## Detailed Setup Instructions

### Finding Your Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Look at the top left - you'll see a project dropdown
3. The ID is shown in the format: `my-project-name-12345`

### Finding Your Bucket Name

1. Go to [Cloud Storage](https://console.cloud.google.com/storage/browser)
2. You'll see a list of all your buckets
3. Copy the exact bucket name (e.g., `my-medical-documents`)

### Creating a Service Account (if you haven't already)

1. Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Give it a name like "medical-ocr-processor"
4. Click "Create and Continue"
5. Grant these roles:
   - `Storage Object Viewer` (to read from GCS)
   - `Vision API User` (to use OCR)
6. Click "Continue" and "Done"
7. Go back to the service account list
8. Click on your new service account
9. Click "Keys" tab
10. Click "Add Key" → "Create new key"
11. Choose "JSON" format
12. Save the file to this project directory as `service-account-key.json`

---

## File Structure After Setup

```
EmoryHacks2025/
├── service-account-key.json      ← Your downloaded credentials
├── config.py                     ← Updated with your project details
├── quickstart.py                 ← Main entry point
├── ocr_medical_documents.py      ← OCR processor
├── ocr_analysis.py               ← Analysis tools
├── setup_credentials.py          ← Credential verification
└── requirements.txt              ← Python dependencies
```

---

## Troubleshooting

### Error: "Service key not found"
- Make sure `service-account-key.json` is in the project root
- File should be placed in: `/Users/hoangyennguyen/Desktop/Projects/EmoryHacks2025/`

### Error: "Invalid credentials"
- Download a fresh service account key
- Make sure you're downloading the JSON format, not P12
- The key might have expired

### Error: "Access Denied" when reading from GCS
- Verify the service account email has these IAM roles:
  - `roles/storage.objectViewer`
  - `roles/storage.bucketViewer`
- Go to: IAM → Select your project → Find service account → Edit roles

### Error: "Vision API not enabled"
- Go to [APIs & Services](https://console.cloud.google.com/apis/library)
- Search for "Vision API"
- Click "Enable"

### Error: "Bucket not found"
- Double-check the bucket name in `config.py` (it's case-sensitive)
- Make sure the bucket exists in your project

---

## Environment Variables (Alternative Method)

If you prefer using environment variables instead of config.py:

```bash
# Set up one time
export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/service-account-key.json"
export GOOGLE_CLOUD_PROJECT="your-project-id"
export GCS_BUCKET="your-bucket-name"

# Then run
python quickstart.py
```

---

## Next Steps

1. ✅ Save service key
2. ✅ Update config.py
3. ✅ Run `python setup_credentials.py`
4. ✅ Upload medical documents to `gs://your-bucket/patient47/users/images/`
5. ✅ Run `python quickstart.py`

---

## Security Best Practices

🔒 **Important Security Notes:**

1. **Never commit the service key to git!**
   ```bash
   echo "service-account-key.json" >> .gitignore
   ```

2. **Keep your service key safe** - it's like a password
   - Don't share it with others
   - Don't check it into version control
   - Store it securely on your machine

3. **Rotate keys regularly**
   - Go to Service Accounts → Keys
   - Delete old keys and create new ones

4. **Use minimal permissions** - service account only has:
   - Storage Object Viewer (read from GCS)
   - Vision API User (use OCR)

---

## Support

For more information:
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [Vision API Guide](https://cloud.google.com/vision/docs)
- [Cloud Storage Guide](https://cloud.google.com/storage/docs)
