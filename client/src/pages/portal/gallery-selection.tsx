import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { ArrowLeft, Check, Plus, Info, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SEOHead } from "@shared/components";
import { WebHeader } from "@/components/WebHeader";

type SelectionState = "none" | "included" | "extra_pending" | "extra_paid" | "extra_free" | "blocked";

type FileItem = {
  id: number;
  originalFilename: string;
  previewPath?: string;
  filePath: string;
  isCandidate: boolean;
  selectionState: SelectionState;
};

type PackageStats = {
  includedCount: number;
  extraPaidCount: number;
  extraFreeCount: number;
  extraPendingCount: number;
  totalIncluded: number;
  totalExtra: number;
  remainingInPackage: number;
};

type GalleryResponse = {
  job: {
    id: number;
    displayId: string;
    includedImages?: number;
    maxSelectable?: number;
    extraPricePerImage?: number;
    allImagesIncluded: boolean;
  };
  files: FileItem[];
  stats: PackageStats;
};

export default function GallerySelection() {
  const { isLoading: authLoading } = useAuthGuard();
  const { jobId: paramJobId } = useParams<{ jobId?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const urlParams = new URLSearchParams(window.location.search);
  const queryJobId = urlParams.get("jobId");
  const jobId = paramJobId || queryJobId;

  const { data: galleryData, isLoading, isError, refetch } = useQuery<GalleryResponse>({
    queryKey: ["/api/jobs", jobId, "gallery"],
    enabled: !!jobId,
  });

  const selectMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/select-image`, { 
        fileId, 
        action: 'select'
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Auswahl konnte nicht gespeichert werden",
        variant: "destructive",
      });
    },
  });

  const deselectMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await apiRequest("POST", `/api/jobs/${jobId}/select-image`, { 
        fileId, 
        action: 'deselect'
      });
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler",
        description: error.message || "Bild konnte nicht abgewählt werden",
        variant: "destructive",
      });
    },
  });

  if (authLoading) return null;

  const handleSelectAsIncluded = (fileId: string) => {
    selectMutation.mutate(fileId);
  };

  const handleDeselect = (fileId: string) => {
    deselectMutation.mutate(fileId);
  };

  const canSelectMoreIncluded = (stats: PackageStats, job: GalleryResponse['job']) => {
    if (job.allImagesIncluded) return true;
    if (!job.maxSelectable) return true;
    return stats.remainingInPackage > 0;
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return "0,00";
    return (cents / 100).toFixed(2).replace(".", ",");
  };

  const { job, files, stats } = galleryData || { job: null, files: [], stats: null };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Bildauswahl - pix.immo"
        description="Wählen Sie die Bilder für die Bearbeitung aus"
      />

      <WebHeader />

      {/* Page Header */}
      <div className="border-b bg-card sticky top-[60px] z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/portal/uploads")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Bildauswahl</h1>
              <p className="text-sm text-muted-foreground">
                Auftrag {job?.displayId || jobId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h3 className="text-base font-semibold mb-2 text-destructive" data-testid="text-error-title">
                Fehler beim Laden
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6" data-testid="text-error-description">
                Die Bilder konnten nicht geladen werden. Bitte versuchen Sie es erneut.
              </p>
              <Button onClick={() => setLocation("/portal/uploads")} data-testid="button-back-to-uploads">
                Zurück zur Übersicht
              </Button>
            </CardContent>
          </Card>
        ) : !files || files.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h3 className="text-base font-semibold mb-2" data-testid="text-no-images">
                Keine Bilder gefunden
              </h3>
              <p className="text-muted-foreground">
                Für diesen Auftrag wurden noch keine Bilder hochgeladen.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Package Status Card */}
            {job && stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Paket-Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.allImagesIncluded ? (
                    <Alert>
                      <Check className="w-4 h-4" />
                      <AlertDescription>
                        Alle Bilder sind im Paket inkludiert (Kulanz aktiv)
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Im Paket inkludiert</p>
                          <p className="text-2xl font-bold" data-testid="text-included-count">
                            {stats.includedCount} / {job.includedImages || "∞"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Extra-Bilder (bezahlt)</p>
                          <p className="text-2xl font-bold" data-testid="text-extra-paid-count">
                            {stats.extraPaidCount}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Extra-Bilder (Kulanz)</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-extra-free-count">
                            {stats.extraFreeCount}
                          </p>
                        </div>
                      </div>

                      {job.maxSelectable && (
                        <>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Fortschritt</span>
                              <span className="font-medium">
                                {stats.remainingInPackage} verbleibend
                              </span>
                            </div>
                            <Progress 
                              value={(stats.includedCount / job.maxSelectable) * 100} 
                              className="h-2"
                            />
                          </div>

                          {stats.remainingInPackage === 0 && stats.extraPendingCount === 0 && (
                            <Alert>
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription>
                                Paket voll. Weitere Bilder kosten je {formatPrice(job.extraPricePerImage)} €
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      )}

                      {stats.extraPendingCount > 0 && (
                        <Alert>
                          <Info className="w-4 h-4" />
                          <AlertDescription>
                            {stats.extraPendingCount} Extra-Bild(er) warten auf Bezahlung ({formatPrice((job.extraPricePerImage || 0) * stats.extraPendingCount)} €)
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.filter(f => f.isCandidate).map((file) => {
                const isSelected = file.selectionState !== "none";
                const canInclude = job && stats && canSelectMoreIncluded(stats, job);

                return (
                  <div
                    key={file.id}
                    className="relative group"
                    data-testid={`image-${file.id}`}
                  >
                    <div className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/20"
                    }`}>
                      <img
                        src={file.previewPath || file.filePath}
                        alt={file.originalFilename}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Selection Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant={
                            file.selectionState === "included" ? "default" :
                            file.selectionState === "extra_free" ? "default" :
                            file.selectionState === "extra_paid" ? "secondary" :
                            "outline"
                          }
                          className="text-xs"
                        >
                          {file.selectionState === "included" ? "Inkludiert" :
                           file.selectionState === "extra_free" ? "Kulanz" :
                           file.selectionState === "extra_paid" ? "Extra (bezahlt)" :
                           file.selectionState === "extra_pending" ? "Extra (offen)" :
                           "Ausgewählt"}
                        </Badge>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-2 flex gap-2">
                      {!isSelected ? (
                        <Button
                          size="sm"
                          onClick={() => handleSelectAsIncluded(String(file.id))}
                          disabled={selectMutation.isPending}
                          className="flex-1"
                          data-testid={`button-select-${file.id}`}
                        >
                          {canInclude ? (
                            <>
                              <Check className="w-3 h-3 mr-1" />
                              Auswählen
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              {job && job.extraPricePerImage ? `${formatPrice(job.extraPricePerImage)} €` : 'Extra'}
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeselect(String(file.id))}
                          disabled={deselectMutation.isPending}
                          className="flex-1"
                          data-testid={`button-deselect-${file.id}`}
                        >
                          Abwählen
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {file.originalFilename}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
