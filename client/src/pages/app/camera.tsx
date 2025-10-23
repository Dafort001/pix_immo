import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { X, RotateCcw, Zap, ZapOff } from "lucide-react";
import { StatusBar } from "@/components/mobile/StatusBar";
import { HapticButton } from "@/components/mobile/HapticButton";
import { useToast } from "@/hooks/use-toast";

export default function CameraScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 4032 },
          height: { ideal: 3024 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Camera access error:", error);
      setCameraError("Kamera-Zugriff verweigert");
      toast({
        title: "Kamera-Fehler",
        description: "Zugriff auf die Kamera wurde verweigert.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL("image/jpeg", 0.95);

    // Store in sessionStorage
    const photos = JSON.parse(sessionStorage.getItem("appPhotos") || "[]");
    photos.push(photoData);
    sessionStorage.setItem("appPhotos", JSON.stringify(photos));

    setPhotoCount(photos.length);
    toast({
      title: "Foto aufgenommen",
      description: `${photos.length} Foto(s) gespeichert`,
    });
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setLocation("/app");
  };

  const goToGallery = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setLocation("/app/gallery");
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 text-white">
        <StatusBar />
      </div>

      {/* Camera Preview or Error */}
      {cameraError ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-white p-8">
            <p className="text-lg mb-4" data-testid="text-camera-error">{cameraError}</p>
            <HapticButton
              variant="outline"
              onClick={startCamera}
              className="text-white border-white hover:bg-white/10"
              data-testid="button-retry-camera"
            >
              Erneut versuchen
            </HapticButton>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover z-0"
          data-testid="video-camera-preview"
        />
      )}

      {/* UI Overlay - Force new compositing layer for iOS Safari */}
      <div className="fixed inset-0 z-50 pointer-events-none" style={{ transform: 'translateZ(0)' }}>
        {/* Top Controls - DEBUG VERSION */}
        <div className="absolute top-16 left-0 right-0 flex items-center justify-between px-6 pointer-events-auto">
          <div 
            onClick={closeCamera}
            className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
            data-testid="button-close-camera"
          >
            X
          </div>

          <div 
            onClick={flipCamera}
            className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
            data-testid="button-flip-camera"
          >
            ↻
          </div>
        </div>

        {/* Bottom Controls - DEBUG VERSION */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 pointer-events-auto">
          <div className="flex items-center justify-center gap-8 px-6">
            {/* Flash Toggle */}
            <div 
              onClick={() => setFlashEnabled(!flashEnabled)}
              className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center text-black text-2xl font-bold cursor-pointer"
              data-testid="button-toggle-flash"
            >
              ⚡
            </div>

            {/* Capture Button */}
            <div 
              onClick={capturePhoto}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold cursor-pointer"
              data-testid="button-capture-photo"
            >
              📷
            </div>

            {/* Gallery Button */}
            <div 
              onClick={goToGallery}
              className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold cursor-pointer"
              data-testid="button-goto-gallery"
            >
              {photoCount || "📁"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
