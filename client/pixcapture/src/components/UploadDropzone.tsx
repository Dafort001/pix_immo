import { useCallback, useState } from "react";
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UploadIntentResponse } from "@shared/schema";

interface FileUploadItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "uploaded" | "failed";
  progress: number;
  objectKey?: string;
  error?: string;
}

interface UploadDropzoneProps {
  onUploadComplete?: (objectKeys: string[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
}

export function UploadDropzone({
  onUploadComplete,
  maxFiles = 10,
  maxFileSizeMB = 100,
}: UploadDropzoneProps) {
  const { toast } = useToast();
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const maxSize = maxFileSizeMB * 1024 * 1024;

    // Filter and validate files
    const validFiles = newFiles.filter((file) => {
      if (file.size > maxSize) {
        toast({
          variant: "destructive",
          title: "Datei zu groß",
          description: `${file.name} überschreitet ${maxFileSizeMB} MB`,
        });
        return false;
      }

      if (!file.type.match(/^image\/(jpeg|png|heic|webp)$/)) {
        toast({
          variant: "destructive",
          title: "Ungültiges Format",
          description: `${file.name} ist kein gültiges Bildformat`,
        });
        return false;
      }

      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      toast({
        variant: "destructive",
        title: "Zu viele Dateien",
        description: `Maximal ${maxFiles} Dateien erlaubt`,
      });
      return;
    }

    const newFileItems: FileUploadItem[] = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFileItems]);

    // Auto-upload after adding files
    newFileItems.forEach((item) => uploadFile(item));
  };

  const uploadFile = async (item: FileUploadItem) => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploading", progress: 10 } : f))
      );

      // Step 1: Request upload intent
      const intentRes = await apiRequest(
        "POST",
        "/api/pixcapture/upload/intent",
        {
          filename: item.file.name,
          mimeType: item.file.type,
          fileSize: item.file.size,
        }
      );
      const intent: UploadIntentResponse = await intentRes.json();

      // Update progress
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, progress: 30, objectKey: intent.objectKey } : f))
      );

      // Step 2: Upload to R2 using signed URL
      const uploadResponse = await fetch(intent.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": item.file.type,
        },
        body: item.file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`R2 upload failed: ${uploadResponse.statusText}`);
      }

      // Update progress
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, progress: 80 } : f))
      );

      // Step 3: Finalize upload
      await apiRequest("POST", "/api/pixcapture/upload/finalize", {
        objectKey: intent.objectKey,
      });

      // Success!
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: "uploaded", progress: 100 } : f))
      );

      toast({
        title: "Upload erfolgreich",
        description: `${item.file.name} wurde hochgeladen`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: "failed",
                error: error instanceof Error ? error.message : "Upload fehlgeschlagen",
              }
            : f
        )
      );

      toast({
        variant: "destructive",
        title: "Upload fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      });
    }
  };

  const retryUpload = (item: FileUploadItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === item.id ? { ...f, status: "pending", progress: 0, error: undefined } : f))
    );
    uploadFile(item);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    const uploadedKeys = files
      .filter((f) => f.status === "uploaded" && f.objectKey)
      .map((f) => f.objectKey!);

    if (uploadedKeys.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedKeys);
    }

    setFiles((prev) => prev.filter((f) => f.status !== "uploaded"));
  };

  const completedCount = files.filter((f) => f.status === "uploaded").length;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Dateien hier ablegen oder auswählen
        </p>
        <p className="text-sm text-gray-600 mb-6">
          JPEG, PNG, HEIC bis {maxFileSizeMB} MB · Max {maxFiles} Dateien
        </p>
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept="image/jpeg,image/png,image/heic,image/webp"
          multiple
          onChange={handleFileSelect}
          data-testid="input-file-upload"
        />
        <Button
          onClick={() => document.getElementById("file-input")?.click()}
          data-testid="button-select-files"
        >
          Dateien auswählen
        </Button>
      </div>

      {/* Upload Queue */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploads ({completedCount}/{files.length})
            </h3>
            {completedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                data-testid="button-clear-completed"
              >
                Abgeschlossene löschen
              </Button>
            )}
          </div>

          {/* Statistics */}
          {(uploadingCount > 0 || failedCount > 0) && (
            <div className="flex gap-4 text-sm">
              {uploadingCount > 0 && (
                <span className="text-blue-600 flex items-center gap-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadingCount} läuft
                </span>
              )}
              {failedCount > 0 && (
                <span className="text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {failedCount} fehlgeschlagen
                </span>
              )}
            </div>
          )}

          {/* File List */}
          <div className="space-y-2">
            {files.map((item) => (
              <Card key={item.id} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {item.status === "uploaded" && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {item.status === "uploading" && (
                        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                      )}
                      {item.status === "failed" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      {item.status === "pending" && (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {(item.status === "uploading" || item.status === "pending") && (
                      <div className="flex-1">
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex-shrink-0">
                      {item.status === "failed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => retryUpload(item)}
                          data-testid={`button-retry-${item.id}`}
                        >
                          Wiederholen
                        </Button>
                      )}
                      {item.status !== "uploading" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(item.id)}
                          data-testid={`button-remove-${item.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
