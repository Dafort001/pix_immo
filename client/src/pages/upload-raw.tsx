import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileImage, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { useLocation } from "wouter";

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

interface UploadFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
  uploadId?: string;
  etags?: string[];
}

interface Job {
  id: string;
  jobNumber: string;
  propertyName: string;
  status: string;
}

export default function UploadRawPage() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const { data: jobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const initUploadMutation = useMutation({
    mutationFn: async (params: { jobId: string; filename: string; filesize: number; mimetype: string }) => {
      const res = await apiRequest("POST", "/api/uploads/init", params);
      return await res.json();
    },
  });

  const uploadPartMutation = useMutation({
    mutationFn: async ({ url, chunk }: { url: string; chunk: Blob }) => {
      const res = await fetch(url, {
        method: "PUT",
        body: chunk,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });
      return res.headers.get("ETag") || "";
    },
  });

  const completeUploadMutation = useMutation({
    mutationFn: async (params: { uploadId: string; etags: string[] }) => {
      const res = await apiRequest("POST", "/api/uploads/complete", params);
      return await res.json();
    },
  });

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  }, []);

  const addFiles = (files: File[]) => {
    const validExtensions = [
      ".cr2", ".cr3", ".crm", ".crw", ".nef", ".nrw", ".arw", ".sr2", ".srf", ".raf",
      ".rw2", ".rwl", ".dng", ".orf", ".pef", ".braw", ".r3d", ".ari", ".mxf",
      ".cdng", ".iiq", ".3fr", ".fff", ".x3f", ".erf", ".srw", ".mef", ".mos",
      ".cap", ".kdc", ".tiff", ".tif", ".jpg", ".jpeg"
    ];
    const newFiles = files
      .filter((file) => {
        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (!validExtensions.includes(ext)) {
          toast({
            title: "Ungültiges Dateiformat",
            description: `${file.name} wird nicht unterstützt. Erlaubte Formate: RAW (CR2/CR3/NEF/ARW/DNG etc.), Video-RAW (BRAW/R3D/MXF), TIFF, JPG`,
            variant: "destructive",
          });
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        id: `${Date.now()}-${file.name}`,
        status: "pending" as const,
        progress: 0,
      }));

    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    if (!selectedJobId) {
      toast({
        title: "Fehler",
        description: "Bitte wähle zuerst einen Job aus",
        variant: "destructive",
      });
      return;
    }

    setUploadFiles((prev) =>
      prev.map((f) => (f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f))
    );

    try {
      const initResponse = await initUploadMutation.mutateAsync({
        jobId: selectedJobId,
        filename: uploadFile.file.name,
        filesize: uploadFile.file.size,
        mimetype: uploadFile.file.type || "application/octet-stream",
      });

      const { uploadId, presignedUrls, partCount } = initResponse;
      const chunkSize = 10 * 1024 * 1024;
      const etags: string[] = [];

      for (let i = 0; i < partCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, uploadFile.file.size);
        const chunk = uploadFile.file.slice(start, end);

        const etag = await uploadPartMutation.mutateAsync({
          url: presignedUrls[i],
          chunk,
        });

        etags.push(etag);

        const progress = Math.round(((i + 1) / partCount) * 100);
        setUploadFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress } : f))
        );
      }

      await completeUploadMutation.mutateAsync({
        uploadId,
        etags,
      });

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "completed" as const, progress: 100 } : f
        )
      );

      toast({
        title: "Upload erfolgreich",
        description: `${uploadFile.file.name} wurde hochgeladen`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error" as const, error: "Upload fehlgeschlagen" }
            : f
        )
      );

      toast({
        title: "Upload fehlgeschlagen",
        description: `Fehler beim Hochladen von ${uploadFile.file.name}`,
        variant: "destructive",
      });
      
      // Rethrow to notify startUpload of the failure
      throw error;
    }
  };

  const startUpload = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");
    let hasErrors = false;

    for (const file of pendingFiles) {
      try {
        await uploadFile(file);
      } catch (error) {
        hasErrors = true;
      }
    }

    // If no errors occurred and we have a selected job, redirect after uploads complete
    if (!hasErrors && selectedJobId && pendingFiles.length > 0) {
      toast({
        title: "Alle Uploads abgeschlossen",
        description: "Du wirst zur RAW-Stacks-Seite weitergeleitet...",
      });
      
      // Redirect to RAW stacks page
      setTimeout(() => {
        setLocation(`/admin/raw-stacks/${selectedJobId}`);
      }, 1500);
    }
  };

  if (authLoading || userLoading) return null;
  if (!userData) return null;

  return (
    <AdminLayout userRole={userData.user.role}>
      <div className="flex flex-col h-full">
        <AdminPageHeader title="RAW-Dateien hochladen" showBackButton />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Job auswählen</CardTitle>
                <CardDescription>Wähle den Job aus, zu dem die RAW-Dateien gehören</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full rounded-lg border px-4 py-3"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  data-testid="select-job"
                >
                  <option value="">Bitte wählen...</option>
                  {jobs?.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.jobNumber} - {job.propertyName}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Dateien hochladen</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-2xl min-h-64 flex flex-col items-center justify-center
                    transition-colors cursor-pointer
                    ${isDragActive ? "border-primary bg-primary/5" : "border-border"}
                  `}
                  data-testid="dropzone-upload"
                >
                  <input
                    type="file"
                    multiple
                    accept=".cr2,.cr3,.crm,.crw,.nef,.nrw,.arw,.sr2,.srf,.raf,.rw2,.rwl,.dng,.orf,.pef,.braw,.r3d,.ari,.mxf,.cdng,.iiq,.3fr,.fff,.x3f,.erf,.srw,.mef,.mos,.cap,.kdc,.tiff,.tif,.jpg,.jpeg"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    data-testid="input-file"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full p-8"
                  >
                    <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">
                      Dateien hierher ziehen oder klicken zum Auswählen
                    </p>
                    <p className="text-sm text-muted-foreground">
                      RAW, Video-RAW, TIFF, JPG (alle gängigen Kamera-Formate)
                    </p>
                  </label>
                </div>

                {uploadFiles.length > 0 && (
                  <div className="mt-6 space-y-3">
                    {uploadFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-4 border rounded-lg"
                        data-testid={`upload-file-${file.id}`}
                      >
                        <FileImage className="w-8 h-8 text-muted-foreground flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                          {file.status === "uploading" && (
                            <Progress value={file.progress} className="mt-2" />
                          )}

                          {file.status === "error" && (
                            <p className="text-sm text-destructive mt-1">{file.error}</p>
                          )}
                        </div>

                        {file.status === "completed" && (
                          <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                        )}

                        {file.status === "error" && (
                          <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                        )}

                        {file.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFile(file.id)}
                            data-testid={`button-remove-${file.id}`}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {uploadFiles.length > 0 && (
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setUploadFiles([])}
                      data-testid="button-clear-all"
                    >
                      Alle entfernen
                    </Button>
                    <Button
                      onClick={startUpload}
                      disabled={
                        !selectedJobId ||
                        uploadFiles.filter((f) => f.status === "pending").length === 0
                      }
                      data-testid="button-start-upload"
                    >
                      Upload starten ({uploadFiles.filter((f) => f.status === "pending").length})
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
