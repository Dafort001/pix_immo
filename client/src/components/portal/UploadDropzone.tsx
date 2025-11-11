import { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface UploadDropzoneProps {
  orderId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  accept?: string;
}

export function UploadDropzone({
  orderId,
  onUploadComplete,
  maxFiles = 50,
  accept = 'image/*',
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      // 1. Get upload intent
      const intentResponse = await fetch(`/api/orders/${orderId}/upload/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          filename: uploadFile.file.name,
          contentType: uploadFile.file.type,
        }),
      });

      if (!intentResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, fileId } = await intentResponse.json();

      // 2. Upload to signed URL
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 50 } : f
        )
      );

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: uploadFile.file,
        headers: { 'Content-Type': uploadFile.file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // 3. Finalize upload
      const finalizeResponse = await fetch(`/api/orders/${orderId}/upload/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileId }),
      });

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload');
      }

      // Success!
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: 'success', progress: 100 } : f
        )
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
            : f
        )
      );
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      const newFiles: UploadFile[] = droppedFiles.slice(0, maxFiles - files.length).map((file) => ({
        file,
        id: Math.random().toString(36).substring(7),
        status: 'pending',
        progress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploads
      newFiles.forEach((f) => uploadFile(f));
    },
    [files.length, maxFiles]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const newFiles: UploadFile[] = selectedFiles.slice(0, maxFiles - files.length).map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Start uploads
    newFiles.forEach((f) => uploadFile(f));

    // Reset input
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const successCount = files.filter((f) => f.status === 'success').length;
  const allComplete = files.length > 0 && files.every((f) => f.status === 'success' || f.status === 'error');

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <Card
        className={cn(
          'p-12 border-2 border-dashed transition-colors',
          dragActive && 'border-primary bg-primary/5',
          !dragActive && 'hover:border-primary/50'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        data-testid="dropzone"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload up to {maxFiles} files (JPG, PNG, HEIC, RAW)
          </p>
          <input
            type="file"
            id="file-input"
            className="hidden"
            multiple
            accept={accept}
            onChange={handleFileInput}
            data-testid="input-file"
          />
          <Button asChild data-testid="button-browse">
            <label htmlFor="file-input" className="cursor-pointer">
              Browse Files
            </label>
          </Button>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">
                Uploading {files.length} file{files.length !== 1 ? 's' : ''}
              </h4>
              {successCount > 0 && (
                <span className="text-sm text-green-600">
                  {successCount} complete
                </span>
              )}
            </div>

            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded"
                data-testid={`upload-item-${file.id}`}
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  {(file.status === 'pending' || file.status === 'uploading') && (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-destructive">{file.error}</p>
                  )}
                  {(file.status === 'uploading' || file.status === 'pending') && (
                    <Progress value={file.progress} className="h-1 mt-1" />
                  )}
                </div>

                {/* Remove Button */}
                {file.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    data-testid={`button-remove-${file.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Complete Button */}
          {allComplete && onUploadComplete && (
            <Button
              className="w-full mt-4"
              onClick={onUploadComplete}
              data-testid="button-upload-complete"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Done
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
