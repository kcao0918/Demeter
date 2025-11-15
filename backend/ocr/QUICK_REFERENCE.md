# Firebase OCR Integration - Quick Reference

## 📍 Storage Paths

```
Firebase Storage: gs://patient67.firebasestorage.app/
├── users/{uid}/images/          ← OCR reads from here ✅
└── (Firestore) users/{uid}/ocr_results/  ← Results saved here ✅
```

## 🚀 Quick Start

### 1. Upload Image
```bash
curl -X POST http://localhost:8080/upload \
  -F "file=@medical_document.jpg" \
  -F "uid=user123"
```
→ Saved to: `users/user123/images/timestamp-medical_document.jpg`

### 2. Process OCR
```bash
curl -X POST http://localhost:8080/process-ocr \
  -H "Content-Type: application/json" \
  -d '{"uid": "user123"}'
```
→ Processes all images in `users/user123/images/`

### 3. Get Results
```bash
curl http://localhost:8080/ocr-results/user123
```
→ Returns all OCR results from Firestore

## 📝 Test Locally

```bash
cd backend/ocr

# Run integration tests
python3 test_firebase_integration.py

# Or run quickstart script
python3 quickstart.py
```

## 🔍 What's Verified

- ✅ Images stored at `users/{uid}/images/`
- ✅ OCR reads from `users/{uid}/images/`
- ✅ Results saved to Firestore at `users/{uid}/ocr_results/`
- ✅ Server endpoints operational
- ✅ WebSocket real-time updates
- ✅ Error handling implemented

## 📂 Files Modified

1. `backend/ocr/ocr_medical_documents.py` - OCR processor
2. `backend/ocr/quickstart.py` - Entry point script
3. `backend/ocr/config.py` - Configuration
4. `backend/server.js` - API endpoints
5. `backend/ocr/test_firebase_integration.py` - Tests
6. `backend/ocr/FIREBASE_VERIFICATION.md` - Docs

## 🔗 API Reference

### POST /process-ocr
Triggers OCR processing for a user's images
```json
{
  "uid": "user123",
  "subfolder": "images" // optional, default is "images"
}
```
Response: `{ status: "processing", storagePath: "users/user123/images/", ... }`

### GET /ocr-results/:uid
Retrieves OCR results from Firestore
```
GET /ocr-results/user123
```
Response:
```json
{
  "uid": "user123",
  "count": 2,
  "results": [
    {
      "file_path": "users/user123/images/...",
      "full_text": "...",
      "text_blocks": [...],
      "status": "completed"
    }
  ]
}
```

## 💾 Result Document Schema

```json
{
  "file_path": "users/uid/images/file.jpg",
  "gcs_uri": "gs://bucket/users/uid/images/file.jpg",
  "full_text": "extracted text...",
  "text_blocks": [{ "text": "...", "confidence": 0.95 }],
  "status": "completed",
  "error": null,
  "timestamp": "2025-11-15T...",
  "stored_at": 1731667845123
}
```

## 🌐 WebSocket Events

```javascript
socket.on("ocr_start", (data) => { /* started */ });
socket.on("ocr_progress", (data) => { /* processing */ });
socket.on("ocr_complete", (data) => { /* done */ });
socket.on("ocr_error", (data) => { /* error */ });
```

## ✔️ Verification Checklist

- [x] Images upload to `users/{uid}/images/` 
- [x] OCR scans `users/{uid}/images/`
- [x] Vertex AI OCR processes images
- [x] Results saved to Firestore `users/{uid}/ocr_results/`
- [x] Server endpoints working
- [x] WebSocket events emitting
- [x] Error handling in place
- [x] Tests passing

## 🆘 Troubleshooting

**No images found?**
→ Check images uploaded to `users/{uid}/images/` in Firebase Storage

**OCR fails?**
→ Verify `FIREBASE_SERVICE_KEY` in .env has Vertex AI permissions

**Results not appearing?**
→ Check Firestore collection `users/{uid}/ocr_results/`

**Connection issues?**
→ Ensure backend server running on port 8080

---

**Status: ✅ Complete and Ready**
