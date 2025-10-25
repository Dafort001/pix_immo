import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  FileDown,
  AlertCircle,
  Loader2,
  Eye
} from "lucide-react";
import { GalleryGrid, GalleryFile } from "@/components/gallery/GalleryGrid";
import { DetailSidebar } from "@/components/gallery/DetailSidebar";
import { MaskEditor } from "@/components/gallery/MaskEditor";
import { SEOHead } from "@/components/SEOHead";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EditingGallery() {
  const { toast } = useToast();
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [detailFile, setDetailFile] = useState<GalleryFile | null>(null);
  const [maskEditorFile, setMaskEditorFile] = useState<GalleryFile | null>(null);
  const [bulkStatusAction, setBulkStatusAction] = useState<string>("approve");

  // Get galleryId from URL parameters, or auto-create a new gallery
  const urlParams = new URLSearchParams(window.location.search);
  const galleryIdParam = urlParams.get("galleryId");
  const [galleryId, setGalleryId] = useState<number | null>(
    galleryIdParam ? parseInt(galleryIdParam, 10) : null
  );

  // Prevent duplicate gallery creation in React 18 Strict Mode
  const hasCreatedGallery = useRef(false);

  // Auto-create gallery if no ID provided
  const createGalleryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/gallery", {
        type: "final_edited",
        name: `Final Editing ${new Date().toLocaleDateString()}`,
        description: "Final edited images for client review",
      });
    },
    onSuccess: (data: any) => {
      setGalleryId(data.id);
      toast({
        title: "Gallery created",
        description: "New gallery ready for final edits",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create gallery",
        description: error.message,
        variant: "destructive",
      });
      hasCreatedGallery.current = false; // Allow retry
    },
  });

  // Create gallery on mount if not provided (with duplicate prevention)
  useEffect(() => {
    if (!galleryId && !hasCreatedGallery.current && !createGalleryMutation.isPending) {
      hasCreatedGallery.current = true;
      createGalleryMutation.mutate();
    }
  }, [galleryId]);

  const { data: galleryData, isLoading, error } = useQuery<{
    gallery: any;
    files: GalleryFile[];
  }>({
    queryKey: ["/api/gallery", galleryId],
    enabled: !!galleryId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ fileIds, status }: { fileIds: number[]; status: string }) => {
      // Bulk update status for multiple files
      const promises = fileIds.map((fileId) =>
        apiRequest("PATCH", `/api/gallery/file/${fileId}/settings`, { status })
      );
      await Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Status updated",
        description: `${variables.fileIds.length} file(s) marked as ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", galleryId] });
      setSelectedFileIds([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const finalizeGalleryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/gallery/${galleryId}/finalize`, {});
    },
    onSuccess: () => {
      toast({
        title: "Gallery finalized",
        description: "Approved files ready for delivery",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery", galleryId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to finalize gallery",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const gallery = galleryData?.gallery;
  const files = galleryData?.files || [];

  // Count files by status
  const approvedCount = files.filter((f) => f.status === "ready").length;
  const rejectedCount = files.filter((f) => f.status === "failed").length;
  const pendingCount = files.filter((f) => f.status === "pending" || f.status === "processing").length;

  const handleBulkStatusChange = () => {
    if (selectedFileIds.length === 0) return;

    const statusMap: Record<string, string> = {
      approve: "ready",
      reject: "failed",
      pending: "pending",
    };

    updateStatusMutation.mutate({
      fileIds: selectedFileIds,
      status: statusMap[bulkStatusAction] || "ready",
    });
  };

  const handleBulkDownload = async (ids: number[]) => {
    toast({
      title: "Download started",
      description: `Preparing ${ids.length} file(s) for download`,
    });
  };

  // Gallery creation error state
  if (createGalleryMutation.isError && !galleryId) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead 
          title="Editing Gallery - Error | pix.immo" 
          description="Gallery creation failed"
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              Failed to create gallery. Please try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                hasCreatedGallery.current = false;
                createGalleryMutation.mutate();
              }}
              disabled={createGalleryMutation.isPending}
              data-testid="button-retry-gallery-creation"
            >
              {createGalleryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Retry Gallery Creation"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || (createGalleryMutation.isPending && !createGalleryMutation.isError)) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Editing Gallery | pix.immo"
          description="Review and approve edited images"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Error | pix.immo"
          description="Gallery load error"
        />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load gallery: {(error as Error).message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Editing Gallery | pix.immo"
        description="Review and approve professionally edited real estate images"
      />

      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="heading-editing-gallery">
                    Editing Gallery
                  </h1>
                  <p className="text-muted-foreground">
                    Review, annotate, and approve professionally edited images
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {gallery && (
                    <Badge 
                      variant={gallery.status === "finalized" ? "default" : "secondary"}
                      data-testid="badge-gallery-status"
                    >
                      {gallery.status}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <Card className="p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  {selectedFileIds.length > 0 && (
                    <>
                      <Select value={bulkStatusAction} onValueChange={setBulkStatusAction}>
                        <SelectTrigger className="w-[160px]" data-testid="select-bulk-action">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="pending">Mark Pending</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={handleBulkStatusChange}
                        disabled={updateStatusMutation.isPending}
                        data-testid="button-apply-bulk-status"
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Apply to {selectedFileIds.length} Selected
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => finalizeGalleryMutation.mutate()}
                    disabled={approvedCount === 0 || finalizeGalleryMutation.isPending}
                    data-testid="button-finalize-gallery"
                  >
                    {finalizeGalleryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Finalizing...
                      </>
                    ) : (
                      <>
                        <FileDown className="w-4 h-4 mr-2" />
                        Finalize Approved
                      </>
                    )}
                  </Button>

                  <div className="flex-1" />

                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium" data-testid="text-total-count">
                        {files.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Approved: </span>
                      <span className="font-medium text-green-600" data-testid="text-approved-count">
                        {approvedCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rejected: </span>
                      <span className="font-medium text-destructive" data-testid="text-rejected-count">
                        {rejectedCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pending: </span>
                      <span className="font-medium text-yellow-600" data-testid="text-pending-count">
                        {pendingCount}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Review Info */}
            <Card className="mb-6 p-4 bg-accent/10 border-accent">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Review & Approval Workflow</p>
                  <p className="text-sm text-muted-foreground">
                    Review edited images, add annotations for revisions, or approve files for final delivery. 
                    Use bulk actions to approve or reject multiple images at once. Finalize when all reviews are complete.
                  </p>
                </div>
              </div>
            </Card>

            {/* Gallery Stats */}
            {gallery && files.length > 0 && (
              <Card className="mb-6 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                    <p className="text-sm text-muted-foreground">Approved</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Download className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.round((approvedCount / files.length) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Complete</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Gallery Grid */}
            <GalleryGrid
              files={files}
              selectedIds={selectedFileIds}
              onSelectionChange={setSelectedFileIds}
              onFileClick={setDetailFile}
              showFilters={true}
              showBulkActions={true}
              onBulkDownload={handleBulkDownload}
            />

            {/* Empty State */}
            {files.length === 0 && (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Eye className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No images to review</h3>
                    <p className="text-muted-foreground">
                      Edited images will appear here for review and approval
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Detail Sidebar */}
        {detailFile && (
          <DetailSidebar
            file={detailFile}
            onClose={() => setDetailFile(null)}
            onOpenMaskEditor={(file) => {
              setMaskEditorFile(file);
              setDetailFile(null);
            }}
          />
        )}
      </div>

      {/* Mask Editor */}
      <MaskEditor
        open={!!maskEditorFile}
        onOpenChange={(open) => {
          if (!open) setMaskEditorFile(null);
        }}
        file={maskEditorFile}
      />
    </div>
  );
}
