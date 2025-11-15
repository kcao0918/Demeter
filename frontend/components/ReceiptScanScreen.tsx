import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { auth } from "../firebaseConfig";

interface ReceiptScanScreenProps {
  onScanComplete: (items: string[]) => void;
  onBack: () => void;
}

export default function ReceiptScanScreen({
  onScanComplete,
  onBack,
}: ReceiptScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startCamera = async () => {
    console.log("Starting camera...");
    try {
      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      console.log("Camera stream received:", mediaStream);
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please check permissions in settings.");
    }
  };

  useEffect(() => {
    // When camera becomes active, set up video playback
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      console.log("Video srcObject set, calling play()...");
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
      });
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    // Auto-open camera when component mounts
    startCamera();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera when component unmounts
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Convert canvas to image data URL
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setCapturedImage(imageData);

        // Stop camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setStream(null);
        setIsCameraActive(false);
      }
    }
  };

  const handleConfirmCaptureTestingOCR = async () => {
    try {
      console.log("🔄 Starting OCR testing workflow...");
      
      // Get current logged-in user's uid
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert("You must be logged in to use OCR");
        return;
      }
      
      const uid = currentUser.uid;
      console.log(`📝 Current User ID: ${uid}`);
      console.log(`📊 Searching for images in: users/${uid}/images/`);

      // Step 1: Trigger OCR processing on most recent image
      console.log("🔍 Step 1: Triggering OCR processing...");
      alert("Processing your images with OCR...");
      
      const ocrResponse = await fetch("http://localhost:8080/process-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      if (!ocrResponse.ok) {
        throw new Error(`OCR trigger failed: ${ocrResponse.statusText}`);
      }

      const ocrData = await ocrResponse.json();
      console.log("✅ OCR processing started", ocrData);

      // Step 2: Wait for OCR to process
      console.log("⏳ Step 2: Waiting for OCR processing (this may take a minute)...");
      alert("Processing images with OCR (this may take a minute)...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Step 3: Retrieve OCR results
      console.log("📥 Step 3: Retrieving OCR results...");
      const resultsResponse = await fetch(
        `http://localhost:8080/ocr-results/${uid}`
      );

      if (!resultsResponse.ok) {
        throw new Error(`Failed to retrieve results: ${resultsResponse.statusText}`);
      }

      const resultsData = await resultsResponse.json();
      console.log("✅ OCR results retrieved", resultsData);

      // Extract text from the most recent result
      if (resultsData.results && resultsData.results.length > 0) {
        const latestResult = resultsData.results[0];
        const extractedText = latestResult.full_text || "";

        console.log("📄 Extracted Text Preview:");
        console.log(extractedText.substring(0, 200) + "...");

        // Step 4: Complete the scan with extracted items
        console.log("🎉 Step 4: Completing scan with extracted data...");
        
        // Parse extracted text into items (split by newlines/common delimiters)
        const items: string[] = extractedText
          .split(/[\n,;]+/)
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0)
          .slice(0, 10); // Limit to 10 items

        alert(`✅ OCR Complete! Extracted ${items.length} items.`);
        onScanComplete(items);
      } else {
        console.warn("⚠️ No OCR results found");
        alert("No images found in your storage or OCR still processing. Please try again.");
      }
    } catch (error) {
      console.error("❌ OCR testing workflow error:", error);
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setStream(null);
    setIsCameraActive(false);
    setTimeout(() => startCamera(), 100);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header with back button and title */}
      <div className="z-50 p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <button onClick={onBack} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
        <h3 className="text-white text-lg font-semibold">Scan Fridge</h3>
        <div className="w-6" />
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera View */}
      <div className="flex-1 flex items-center justify-center relative">
        {capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured receipt"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Semi-transparent overlay for better button visibility */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </>
        ) : isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={
                {
                  WebkitPlaysinline: "true",
                } as React.CSSProperties
              }
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />

            {/* Bottom-left file button - bigger */}
            <button
              onClick={handleRetake}
              className="absolute bottom-8 left-6 z-20 bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-3 transition-all"
            >
              <ImageIcon size={28} />
            </button>

            {/* Bottom capture button (large circle) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-100 shadow-lg flex items-center justify-center transition-all transform hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full border-4 border-gray-300" />
              </button>
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Actions - only when not camera active */}
      {!isCameraActive && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
          {capturedImage ? (
            <>
              <Button
                onClick={handleConfirmCaptureTestingOCR}
                className="w-full h-14 bg-green-600 hover:bg-green-700"
              >
                Confirm & Scan (OCR Test)
              </Button>
              <Button
                onClick={handleRetake}
                variant="outline"
                className="w-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              >
                Retake Photo
              </Button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
