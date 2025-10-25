import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Settings2, 
  Download, 
  FileDown,
  AlertCircle,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { GalleryGrid, GalleryFile } from "@/components/gallery/GalleryGrid";
import { UploadDialog } from "@/components/gallery/UploadDialog";
import { DetailSidebar } from "@/components/gallery/DetailSidebar";
import { MaskEditor } from "@/components/gallery/MaskEditor";
import { SEOHead } from "@/components/SEOHead";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CustomerUploadGallery() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [detailFile, setDetailFile] = useState<GalleryFile | null>(null);
  const [maskEditorFile, setMaskEditorFile] = useState<GalleryFile | null>(null);

  // Fetch gallery - for demo purposes, we'll use galleryId=1
  // In production, this would come from route params or user context
  const galleryId = 1;

  const { data: galleryData, isLoading, error } = useQuery<{
    gallery: any;
    files: GalleryFile[];
  }>({
    queryKey: ["/api/gallery", galleryId],
    enabled: !!galleryId,
  });

  const finalizeGalleryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/gallery/${galleryId}/finalize`, {});
    },
    onSuccess: () => {
      toast({
        title: "Gallery finalized",
        description: "Gallery metadata has been exported",
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

  const handleBulkDownload = async (ids: number[]) => {
    toast({
      title: "Download started",
      description: `Preparing ${ids.length} file(s) for download`,
    });
  };

  const handleBulkDelete = async (ids: number[]) => {
    toast({
      title: "Delete not implemented",
      description: "Bulk delete functionality coming soon",
    });
  };

  const handleBulkSettings = async (ids: number[]) => {
    toast({
      title: "Bulk settings not implemented",
      description: "Bulk settings functionality coming soon",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Customer Upload Gallery | pix.immo"
          description="Upload and manage customer images"
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
        title="Customer Upload Gallery | pix.immo"
        description="Upload and manage customer images for real estate photography"
      />

      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="heading-gallery-title">
                    Customer Upload Gallery
                  </h1>
                  <p className="text-muted-foreground">
                    Upload reference images and specify editing requirements
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

              <Card className="p-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    data-testid="button-open-upload"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleBulkSettings(selectedFileIds)}
                    disabled={selectedFileIds.length === 0}
                    data-testid="button-global-presets"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Apply Global Presets
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => finalizeGalleryMutation.mutate()}
                    disabled={files.length === 0 || finalizeGalleryMutation.isPending}
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
                        Finalize & Export
                      </>
                    )}
                  </Button>

                  <div className="flex-1" />

                  <div className="text-sm text-muted-foreground" data-testid="text-file-count">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </Card>
            </div>

            {/* Gallery Info */}
            {gallery && (
              <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{gallery.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(gallery.updatedAt).toLocaleDateString()}
                    </p>
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
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              onBulkSettings={handleBulkSettings}
            />

            {/* Empty State */}
            {files.length === 0 && (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <Upload className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No files uploaded yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Get started by uploading your first images
                    </p>
                    <Button 
                      onClick={() => setUploadDialogOpen(true)}
                      data-testid="button-upload-empty-state"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
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

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        galleryId={galleryId}
        onUploadComplete={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/gallery", galleryId] });
        }}
      />

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
