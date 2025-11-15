import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import { auth } from "../firebaseConfig";
import { uploadUserFridgeImage } from "../src/utils/uploadService";

interface ReceiptScanScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void; // redirect after upload
}

export default function ReceiptScanScreen({ onBack, onNavigate }: ReceiptScanScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------- CAMERA START --------------------
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera. Check permissions.");
    }
  };

  useEffect(() => {
    if (isCameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraActive, stream]);

  useEffect(() => {
    startCamera();
  }, []);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  // -------------------- CAPTURE PHOTO --------------------
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);

    // Stop camera for preview
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setStream(null);
    setIsCameraActive(false);
  };

  // -------------------- UPLOAD IMAGE --------------------
  const handleUploadImage = async (imageData: string | File) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("You must be logged in.");
      return;
    }

    try {
      let file: File;
      if (typeof imageData === "string") {
        // captured from camera
        const blob = await (await fetch(imageData)).blob();
        file = new File([blob], `fridge-${Date.now()}.jpg`, { type: "image/jpeg" });
      } else {
        // selected from gallery
        file = imageData;
      }

      await uploadUserFridgeImage(file, currentUser.uid);
      alert("Upload successful!");
      onNavigate("recipes"); // redirect after upload
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    }
  };

  // -------------------- HANDLE FILE PICK --------------------
  const handlePickImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadImage(file);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTimeout(() => startCamera(), 200);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="z-50 p-6 flex justify-between items-center bg-black/50 backdrop-blur-sm">
        <button onClick={onBack} className="text-white hover:text-gray-300">
          <X size={24} />
        </button>
        <h3 className="text-white text-lg font-semibold">Scan Fridge</h3>
        <div className="w-6" /> {/* empty space for symmetry */}
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
      />

      {/* CAMERA OR IMAGE PREVIEW */}
      <div className="flex-1 flex items-center justify-center relative">
        {capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
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
            />
            <div className="absolute inset-0 bg-black/20 z-10" />

            {/* Bottom-left gallery button */}
            <button
              onClick={handlePickImage}
              className="absolute bottom-8 left-6 z-20 bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white rounded-full p-3 transition-all"
            >
              <ImageIcon size={28} />
            </button>

            {/* Bottom capture button */}
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

      {/* Bottom Buttons */}
      {!isCameraActive && capturedImage && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 space-y-3">
          <Button
            onClick={() => capturedImage && handleUploadImage(capturedImage)}
            className="w-full h-14 bg-green-600 hover:bg-green-700"
          >
            Confirm Upload
          </Button>

          <Button
            onClick={handleRetake}
            variant="outline"
            className="w-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
          >
            Retake Photo
          </Button>
        </div>
      )}
    </div>
  );
}
