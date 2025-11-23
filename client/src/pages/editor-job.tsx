import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, AlertCircle, CheckCircle2, Clock, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface JobData {
  jobNumber: string;
  propertyName: string;
  propertyAddress: string;
  scheduledAt: number | null;
  totalStacks: number;
  totalRawImages: number;
  shoots: Array<{
    id: string;
    name: string;
    stackCount: number;
    imageCount: number;
  }>;
  briefing?: string;
}

export default function EditorJobPage() {
  const [, params] = useRoute("/editor/job/:jobId");
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  const jobId = params?.jobId;
  const tokenHash = new URLSearchParams(window.location.search).get("token");

  if (!jobId || !tokenHash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              This editor link is invalid or incomplete. Please use the link provided in your assignment email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { data: jobData, isLoading: isLoadingJob, error: jobError } = useQuery<JobData>({
    queryKey: [`/api/editor/job/${jobId}`, tokenHash],
    queryFn: async () => {
      const response = await fetch(`/api/editor/job/${jobId}?token=${tokenHash}`);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to load job data");
      }
      return response.json();
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/editor/job/${jobId}/download?token=${tokenHash}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to generate download URL");
      }
      return response.json();
    },
    onSuccess: (data) => {
      window.open(data.downloadUrl, "_blank");
      toast({
        title: "Download Started",
        description: "Your RAW files download has started.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const requestUploadUrlMutation = useMutation({
    mutationFn: async ({ filename, fileSize, mimeType }: { filename: string; fileSize: number; mimeType: string }) => {
      const response = await fetch(`/api/editor/job/${jobId}/upload-url?token=${tokenHash}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, fileSize, mimeType }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate upload URL");
      }
      return response.json();
    },
  });

  const completeUploadMutation = useMutation({
    mutationFn: async ({ filename, r2Key }: { filename: string; r2Key: string }) => {
      const response = await fetch(`/api/editor/job/${jobId}/upload-complete?token=${tokenHash}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, r2Key }),
      });
      if (!response.ok) {
        throw new Error("Failed to complete upload");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Complete",
        description: "Your edited images have been uploaded successfully.",
      });
      setSelectedFiles(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        const { uploadUrl, r2Key } = await requestUploadUrlMutation.mutateAsync({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        await completeUploadMutation.mutateAsync({
          filename: file.name,
          r2Key,
        });
      }

      toast({
        title: "All Files Uploaded",
        description: `Successfully uploaded ${selectedFiles.length} file(s).`,
      });
      setSelectedFiles(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    }
  };

  if (isLoadingJob) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 animate-spin" />
              <p>Loading job data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              {jobError.message || "Unable to access this job. Your link may have expired."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Editor Job Portal</h1>
          <p className="text-muted-foreground">
            Upload your edited images for job {jobData?.jobNumber}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>Property and shoot details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Job Number</p>
                  <p className="font-medium" data-testid="text-job-number">{jobData?.jobNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Property</p>
                  <p className="font-medium" data-testid="text-property-name">{jobData?.propertyName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium" data-testid="text-property-address">{jobData?.propertyAddress}</p>
                </div>
                {jobData?.scheduledAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="font-medium">
                      {new Date(jobData.scheduledAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-4">
                <Badge variant="outline" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {jobData?.totalStacks} Stacks
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  {jobData?.totalRawImages} RAW Images
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Briefing</CardTitle>
              <CardDescription>Instructions for editing</CardDescription>
            </CardHeader>
            <CardContent>
              {jobData?.briefing ? (
                <div className="prose prose-sm max-w-none">
                  <p>{jobData.briefing}</p>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    <strong>Standard Editing Guidelines:</strong>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>Process all RAW images with standard corrections (exposure, white balance, sharpness)</li>
                      <li>Ensure vertical lines are straightened</li>
                      <li>Remove visible defects and distractions</li>
                      <li>Maintain natural colors and lighting</li>
                      <li>Export as high-quality JPEGs (sRGB, 95% quality)</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Download RAW Files</CardTitle>
              <CardDescription>Download the original images for editing</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => downloadMutation.mutate()}
                disabled={downloadMutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-download-raw"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloadMutation.isPending ? "Generating Download..." : "Download RAW Files"}
              </Button>
              {downloadMutation.isSuccess && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Download link generated. If your download didn't start automatically, click the button again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Edited Images</CardTitle>
              <CardDescription>Upload your finished JPEGs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="block w-full text-sm text-muted-foreground
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary file:text-primary-foreground
                    hover:file:bg-primary/90
                    cursor-pointer"
                  data-testid="input-file-upload"
                />
                {selectedFiles && selectedFiles.length > 0 && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedFiles.length} file(s) selected
                  </p>
                )}
              </div>

              <Button
                onClick={handleFileUpload}
                disabled={
                  !selectedFiles ||
                  selectedFiles.length === 0 ||
                  requestUploadUrlMutation.isPending ||
                  completeUploadMutation.isPending
                }
                className="w-full sm:w-auto"
                data-testid="button-upload-files"
              >
                <Upload className="h-4 w-4 mr-2" />
                {requestUploadUrlMutation.isPending || completeUploadMutation.isPending
                  ? "Uploading..."
                  : "Upload Files"}
              </Button>
            </CardContent>
          </Card>

          {jobData?.shoots && jobData.shoots.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Shoots</CardTitle>
                <CardDescription>Individual photo sessions for this job</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {jobData.shoots.map((shoot) => (
                    <div
                      key={shoot.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{shoot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {shoot.stackCount} stacks, {shoot.imageCount} images
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
