import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { UploadFile, Stack } from '../UploadWorkflow';

interface StepUploadProps {
  files: UploadFile[];
  setFiles: (files: UploadFile[]) => void;
  stacks: Stack[];
  setStacks: (stacks: Stack[]) => void;
  unsortedFiles: UploadFile[];
  setUnsortedFiles: (files: UploadFile[]) => void;
  jobId: string;
}

export function StepUpload({
  files,
  setFiles,
  stacks,
  setStacks,
  jobId,
}: StepUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (fileList: FileList | File[]) => {
      const formData = new FormData();
      Array.from(fileList).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/jobs/${jobId}/workflow/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: async (data) => {
      toast({
        title: 'Upload erfolgreich',
        description: `${data.uploadedCount} Dateien hochgeladen`,
      });
      
      // Fetch updated stacks from backend (replace, don't append to avoid double-counting)
      try {
        const stacksResponse = await fetch(`/api/jobs/${jobId}/workflow/stacks`);
        if (stacksResponse.ok) {
          const stacksData = await stacksResponse.json();
          
          // Convert backend stacks to frontend format
          const fetchedStacks: Stack[] = stacksData.stacks.map((s: any) => ({
            id: s.id,
            files: s.imageIds?.map((imgId: string) => ({
              id: imgId,
              name: `Image ${imgId}`,
              size: 0,
              type: 'image/jpeg',
              url: `/api/images/${imgId}`,
              timestamp: new Date(s.createdAt),
            })) || [],
            roomType: s.roomType || '',
            stackType: s.frameCount === 3 ? 'bracket3' as const : 
                      s.frameCount === 5 ? 'bracket5' as const : 
                      'single' as const,
          }));
          
          // Replace entire stacks array with server truth
          setStacks(fetchedStacks);
          
          const fetchedFiles: UploadFile[] = stacksData.stacks.flatMap((s: any) =>
            s.imageIds?.map((imgId: string) => ({
              id: imgId,
              name: `Image ${imgId}`,
              size: 0,
              type: 'image/jpeg',
              url: `/api/images/${imgId}`,
              timestamp: new Date(s.createdAt),
            })) || []
          );
          
          // Replace entire files array with server truth
          setFiles(fetchedFiles);
        }
      } catch (error) {
        console.error('Failed to fetch stacks:', error);
      }
      
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload fehlgeschlagen',
        description: error.message,
        variant: 'destructive',
      });
      setUploadProgress(0);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        uploadMutation.mutate(droppedFiles);
      }
    },
    [uploadMutation]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadMutation.mutate(e.target.files);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <div>
        <h2 className="mb-2 text-2xl font-semibold">Upload Bereich</h2>
        <p className="text-[#6F6F6F] mb-6">
          Bitte laden Sie alle Dateien zu diesem Objekt hoch.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-24 text-center transition-colors ${
            isDragging
              ? 'border-black bg-[#F7F7F7]'
              : 'border-[#C7C7C7] bg-[#F7F7F7]'
          }`}
          data-testid="upload-dropzone"
        >
          <Upload className="size-16 mx-auto mb-6 text-[#6F6F6F]" />
          <p className="text-xl mb-3">
            Dateien hierher ziehen oder{' '}
            <label className="text-black underline cursor-pointer">
              durchsuchen
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                accept="image/*,video/*"
                data-testid="input-file-upload"
              />
            </label>
          </p>
          <p className="text-[#6F6F6F] text-lg">
            Alle Dateitypen werden akzeptiert
          </p>
        </div>

        {uploadMutation.isPending && (
          <div className="mt-4">
            <div className="h-2 bg-[#E6E6E6] rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-300 animate-pulse"
                style={{ width: '100%' }}
              />
            </div>
            <p className="text-[#6F6F6F] mt-2 text-center">
              Hochladen...
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">
            Hochgeladene Dateien ({files.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="relative group border border-[#C7C7C7] rounded-lg overflow-hidden bg-[#F7F7F7]"
                data-testid={`file-${file.id}`}
              >
                <div className="aspect-square bg-[#E6E6E6] flex items-center justify-center">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-2">
                  <p className="text-xs truncate">{file.name}</p>
                  <p className="text-xs text-[#6F6F6F]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
