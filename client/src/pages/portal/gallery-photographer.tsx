import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/use-auth-guard";
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
import { SEOHead } from "@shared/components";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function PhotographerUploadGallery() {
  const { isLoading: authLoading } = useAuthGuard();
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [detailFile, setDetailFile] = useState<GalleryFile | null>(null);
  const [maskEditorFile, setMaskEditorFile] = useState<GalleryFile | null>(null);

  if (authLoading) return null;

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
        type: "photographer_raw",
        name: `Photographer RAW ${new Date().toLocaleDateString()}`,
        description: "RAW files from photographer",
      });
    },
    onSuccess: (data: any) => {
      setGalleryId(data.id);
      toast({
        title: "Gallery created",
        description: "New gallery ready for RAW uploads",
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

  // Gallery creation error state
  if (createGalleryMutation.isError && !galleryId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEOHead 
          title="Photographer Upload - Error | pix.immo" 
          description="Gallery creation failed"
        />
        <Card className="max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <Camera className="h-10 w-10 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold mb-1">
                  RAW-Galerie konnte nicht erstellt werden
                </h2>
                <p className="text-sm text-muted-foreground">
                  Die Upload-Galerie für RAW-Dateien konnte nicht initialisiert werden.
                </p>
              </div>
            </div>
            
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {(createGalleryMutation.error as Error)?.message || "Unbekannter Fehler"}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Bitte versuchen Sie folgendes:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                <li>Prüfen Sie Ihre Internetverbindung</li>
                <li>Laden Sie die Seite neu (F5)</li>
                <li>Warten Sie einen Moment und versuchen es erneut</li>
                <li>Kontaktieren Sie bei weiterem Problem den Support</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
                data-testid="button-reload-page"
              >
                Seite neu laden
              </Button>
              <Button
                onClick={() => {
                  hasCreatedGallery.current = false;
                  createGalleryMutation.mutate();
                }}
                disabled={createGalleryMutation.isPending}
                className="flex-1"
                data-testid="button-retry-gallery-creation"
              >
                {createGalleryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Erneut versuchen"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading || (createGalleryMutation.isPending && !createGalleryMutation.isError)) {
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <SEOHead
          title="Error | pix.immo"
          description="Gallery load error"
        />
        <Card className="max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold mb-1">
                  RAW-Galerie nicht verfügbar
                </h2>
                <p className="text-sm text-muted-foreground">
                  Die angeforderte Upload-Galerie konnte nicht geladen werden.
                </p>
              </div>
            </div>
            
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {(error as Error).message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">Mögliche Ursachen:</p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4 list-disc">
                <li>Galerie existiert nicht oder wurde gelöscht</li>
                <li>Fehlende Zugriffsrechte für diese Galerie</li>
                <li>URL enthält einen Tippfehler</li>
                <li>Temporäres Server-Problem</li>
              </ul>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => window.location.href = '/portal/uploads'}
                className="w-full"
                data-testid="button-back-to-uploads"
              >
                Zurück zur Übersicht
              </Button>
            </div>
          </div>
        </Card>
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
                  <h1 className="text-lg font-bold mb-2" data-testid="heading-photographer-gallery">
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
      {galleryId && (
        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          galleryId={galleryId}
          onUploadComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/gallery", galleryId] });
          }}
          globalSettings={{
            stylePreset: "PURE",
            windowPreset: "CLEAR",
            skyPreset: "CLEAR BLUE",
            verticalCorrection: true,
          }}
        />
      )}

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
