import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Camera,
  FileDown,
  AlertCircle,
  Loader2
} from "lucide-react";
import { GalleryGrid, GalleryFile } from "@/components/gallery/GalleryGrid";
import { UploadDialog } from "@/components/gallery/UploadDialog";
import { DetailSidebar } from "@/components/gallery/DetailSidebar";
import { MaskEditor } from "@/components/gallery/MaskEditor";
import { SEOHead } from "@/components/SEOHead";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PhotographerUploadGallery() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [detailFile, setDetailFile] = useState<GalleryFile | null>(null);
  const [maskEditorFile, setMaskEditorFile] = useState<GalleryFile | null>(null);

  // Fetch gallery - for demo purposes, we'll use galleryId=2 (photographer type)
  const galleryId = 2;

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
        description: "RAW files ready for editing workflow",
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

  // Count RAW files
  const rawFiles = files.filter((f) => 
    ["dng", "cr2", "nef", "arw", "orf"].includes(f.fileType.toLowerCase())
  );

  const handleBulkDownload = async (ids: number[]) => {
    toast({
      title: "Download started",
      description: `Preparing ${ids.length} RAW file(s) for download`,
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
          title="Photographer Upload | pix.immo"
          description="Upload RAW files from your photography shoot"
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
        title="Photographer Upload Gallery | pix.immo"
        description="Upload and manage RAW files from real estate photography shoots"
      />

      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" data-testid="heading-photographer-gallery">
                    Photographer Upload
                  </h1>
                  <p className="text-muted-foreground">
                    Upload RAW files directly from your camera for professional editing
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
                    <Camera className="w-4 h-4 mr-2" />
                    Upload RAW Files
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
                        Send to Editing
                      </>
                    )}
                  </Button>

                  <div className="flex-1" />

                  <div className="flex gap-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-medium" data-testid="text-total-files">
                        {files.length}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">RAW: </span>
                      <span className="font-medium" data-testid="text-raw-files">
                        {rawFiles.length}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Card */}
            <Card className="mb-6 p-4 bg-accent/10 border-accent">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Photographer Workflow</p>
                  <p className="text-sm text-muted-foreground">
                    Upload all RAW files (DNG, CR2, NEF, ARW, ORF) from your shoot. 
                    Thumbnails will be generated automatically. Once finalized, files 
                    will be sent to the editing workflow for professional retouching.
                  </p>
                </div>
              </div>
            </Card>

            {/* Gallery Info */}
            {gallery && (
              <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Shoot Date</p>
                    <p className="font-medium">
                      {new Date(gallery.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File Format Distribution</p>
                    <div className="flex gap-2 mt-1">
                      {["DNG", "CR2", "NEF", "JPG"].map((format) => {
                        const count = files.filter((f) => 
                          f.fileType.toLowerCase() === format.toLowerCase()
                        ).length;
                        return count > 0 ? (
                          <Badge key={format} variant="outline">
                            {format}: {count}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Size</p>
                    <p className="font-medium">
                      {(files.reduce((sum, f) => sum + f.fileSize, 0) / 1024 / 1024 / 1024).toFixed(2)} GB
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
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No RAW files uploaded yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your RAW files from the photography shoot
                    </p>
                    <Button 
                      onClick={() => setUploadDialogOpen(true)}
                      data-testid="button-upload-empty-state"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload RAW Files
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
        globalSettings={{
          stylePreset: "natural",
          windowPreset: "clear",
          skyPreset: "natural",
          verticalCorrection: true,
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
