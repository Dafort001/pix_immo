import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Settings, Gift, GiftIcon, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { AdminLayout } from "@/components/AdminLayout";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
};

type Job = {
  id: string;
  displayId: string;
  userId: string;
  status: string;
  includedImages?: number;
  maxSelectable?: number;
  extraPricePerImage?: number;
  allImagesIncluded: boolean;
  allowFreeExtras: boolean;
  freeExtraQuota: number;
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

type FileItem = {
  id: number;
  originalFilename: string;
  isCandidate: boolean;
  selectionState: string;
};

type GalleryResponse = {
  job: Job;
  files: FileItem[];
  stats: PackageStats;
};

export default function AdminJobs() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [showKulanzDialog, setShowKulanzDialog] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [showShootsDialog, setShowShootsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  // Package settings form
  const [packageForm, setPackageForm] = useState({
    includedImages: 0,
    maxSelectable: 0,
    extraPricePerImage: 0,
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });

  const { data: galleryData, refetch: refetchGallery } = useQuery<GalleryResponse>({
    queryKey: ['/api/jobs', selectedJobId, 'gallery'],
    enabled: !!selectedJobId && showFilesDialog,
  });

  const { data: shootsData } = useQuery<{
    job: { id: string; jobNumber: string; propertyName: string; customerName: string | null };
    shoots: Array<{ id: string; shootCode: string; status: string; createdAt: number; images: any[] }>;
  }>({
    queryKey: ['/api/jobs', selectedJobId, 'shoots-gallery'],
    enabled: !!selectedJobId && showShootsDialog,
  });

  const updatePackageMutation = useMutation({
    mutationFn: async (data: { jobId: string; settings: typeof packageForm }) => {
      return await apiRequest('PATCH', `/api/admin/jobs/${data.jobId}/package`, data.settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowPackageDialog(false);
      toast({ title: "Paketeinstellungen aktualisiert" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Einstellungen konnten nicht gespeichert werden",
        variant: "destructive"
      });
    },
  });

  const enableAllKulanzMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest('PATCH', `/api/admin/jobs/${jobId}/kulanz-all`, { enabled: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowKulanzDialog(false);
      toast({ title: "Kulanz aktiviert - Alle Bilder inkludiert" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Kulanz konnte nicht aktiviert werden",
        variant: "destructive"
      });
    },
  });

  const fileKulanzMutation = useMutation({
    mutationFn: async (fileId: string) => {
      return await apiRequest('PATCH', `/api/admin/files/${fileId}/kulanz`, {});
    },
    onSuccess: () => {
      refetchGallery();
      toast({ title: "Kulanz für Bild aktiviert" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Kulanz konnte nicht aktiviert werden",
        variant: "destructive"
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest('DELETE', `/api/admin/jobs/${jobId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setShowDeleteDialog(false);
      toast({ 
        title: "Job gelöscht",
        description: "Job und alle zugehörigen Daten wurden entfernt"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Job konnte nicht gelöscht werden",
        variant: "destructive"
      });
    },
  });

  const handleOpenPackageDialog = (job: Job) => {
    setSelectedJobId(job.id);
    setPackageForm({
      includedImages: job.includedImages || 0,
      maxSelectable: job.maxSelectable || 0,
      extraPricePerImage: job.extraPricePerImage || 0,
    });
    setShowPackageDialog(true);
  };

  const handleOpenKulanzDialog = (job: Job) => {
    setSelectedJobId(job.id);
    setShowKulanzDialog(true);
  };

  const handleOpenFilesDialog = (job: Job) => {
    setSelectedJobId(job.id);
    setShowFilesDialog(true);
  };

  const handleOpenShootsDialog = (job: Job) => {
    setSelectedJobId(job.id);
    setShowShootsDialog(true);
  };

  const handleOpenDeleteDialog = (job: Job) => {
    setSelectedJobId(job.id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedJobId) return;
    deleteJobMutation.mutate(selectedJobId);
  };

  const handleSavePackage = () => {
    if (!selectedJobId) return;
    updatePackageMutation.mutate({ 
      jobId: selectedJobId, 
      settings: {
        ...packageForm,
        // Convert to cents
        extraPricePerImage: Math.round(packageForm.extraPricePerImage * 100),
      }
    });
  };

  const handleEnableKulanz = () => {
    if (!selectedJobId) return;
    enableAllKulanzMutation.mutate(selectedJobId);
  };

  const handleFileKulanz = (fileId: number) => {
    fileKulanzMutation.mutate(String(fileId));
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return "0,00";
    return (cents / 100).toFixed(2).replace(".", ",");
  };

  if (authLoading || userLoading) return null;
  if (!userData) return null;

  return (
    <AdminLayout userRole={userData.user.role}>
      <div className="flex flex-col h-full">
        <AdminPageHeader title="Job-Verwaltung (Package & Kulanz)" showBackButton />
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {jobsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : jobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <h3 className="text-base font-semibold mb-2">Keine Jobs gefunden</h3>
                  <p className="text-muted-foreground">Es gibt aktuell keine Jobs im System.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Alle Jobs ({jobs.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paket</TableHead>
                        <TableHead>Extra-Preis</TableHead>
                        <TableHead>Kulanz</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobs.map((job) => (
                        <TableRow key={job.id}>
                          <TableCell className="font-medium" data-testid={`job-${job.id}-displayId`}>
                            {job.displayId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{job.status}</Badge>
                          </TableCell>
                          <TableCell data-testid={`job-${job.id}-package`}>
                            {job.includedImages ? `${job.includedImages} inkl.` : "—"} / {job.maxSelectable ? `max ${job.maxSelectable}` : "∞"}
                          </TableCell>
                          <TableCell data-testid={`job-${job.id}-extra-price`}>
                            {formatPrice(job.extraPricePerImage)} €
                          </TableCell>
                          <TableCell>
                            {job.allImagesIncluded ? (
                              <Badge variant="default" className="bg-green-600 dark:bg-green-500">
                                <GiftIcon className="w-3 h-3 mr-1" />
                                Aktiv
                              </Badge>
                            ) : (
                              <Badge variant="outline">—</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenPackageDialog(job)}
                                data-testid={`button-package-${job.id}`}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenKulanzDialog(job)}
                                data-testid={`button-kulanz-${job.id}`}
                              >
                                <Gift className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenShootsDialog(job)}
                                data-testid={`button-shoots-${job.id}`}
                                title="Shoots anzeigen"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenDeleteDialog(job)}
                                data-testid={`button-delete-${job.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Package Settings Dialog */}
      <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paketeinstellungen bearbeiten</DialogTitle>
            <DialogDescription>
              Passen Sie die Package-Limits für Job {jobs.find(j => j.id === selectedJobId)?.displayId} an
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="includedImages">Inkludierte Bilder im Paket</Label>
              <Input
                id="includedImages"
                type="number"
                value={packageForm.includedImages}
                onChange={(e) => setPackageForm({ ...packageForm, includedImages: parseInt(e.target.value) || 0 })}
                data-testid="input-included-images"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSelectable">Max. auswählbare Bilder</Label>
              <Input
                id="maxSelectable"
                type="number"
                value={packageForm.maxSelectable}
                onChange={(e) => setPackageForm({ ...packageForm, maxSelectable: parseInt(e.target.value) || 0 })}
                data-testid="input-max-selectable"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extraPrice">Extra-Preis pro Bild (€)</Label>
              <Input
                id="extraPrice"
                type="number"
                step="0.01"
                value={packageForm.extraPricePerImage}
                onChange={(e) => setPackageForm({ ...packageForm, extraPricePerImage: parseFloat(e.target.value) || 0 })}
                data-testid="input-extra-price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPackageDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSavePackage} disabled={updatePackageMutation.isPending} data-testid="button-save-package">
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kulanz Dialog */}
      <Dialog open={showKulanzDialog} onOpenChange={setShowKulanzDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kulanz aktivieren</DialogTitle>
            <DialogDescription>
              Alle Bilder für Job {jobs.find(j => j.id === selectedJobId)?.displayId} werden kostenlos inkludiert
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Diese Aktion setzt <code>allImagesIncluded = true</code> und überschreibt alle Package-Limits. Der Kunde kann alle Bilder kostenlos auswählen.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKulanzDialog(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleEnableKulanz} 
              disabled={enableAllKulanzMutation.isPending}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              data-testid="button-confirm-kulanz"
            >
              Kulanz aktivieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Files Dialog with Per-File Kulanz */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bilder & Kulanz</DialogTitle>
            <DialogDescription>
              Job {jobs.find(j => j.id === selectedJobId)?.displayId} - {galleryData?.files.filter(f => f.isCandidate).length || 0} Bilder
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {galleryData && galleryData.stats && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Inkludiert</p>
                    <p className="text-2xl font-bold">{galleryData.stats.includedCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Extra (bezahlt)</p>
                    <p className="text-2xl font-bold">{galleryData.stats.extraPaidCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">Kulanz</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {galleryData.stats.extraFreeCount}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dateiname</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleryData?.files.filter(f => f.isCandidate).map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-mono text-sm">{file.originalFilename}</TableCell>
                    <TableCell>
                      <Badge variant={
                        file.selectionState === "included" ? "default" :
                        file.selectionState === "extra_free" ? "default" :
                        file.selectionState === "extra_paid" ? "secondary" :
                        "outline"
                      }>
                        {file.selectionState === "included" ? "Inkludiert" :
                         file.selectionState === "extra_free" ? "Kulanz" :
                         file.selectionState === "extra_paid" ? "Extra (bezahlt)" :
                         file.selectionState === "extra_pending" ? "Extra (offen)" :
                         "Nicht ausgewählt"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleFileKulanz(file.id)}
                        disabled={file.selectionState === "extra_free" || fileKulanzMutation.isPending}
                        data-testid={`button-file-kulanz-${file.id}`}
                      >
                        <Gift className="w-4 h-4 mr-1" />
                        {file.selectionState === "extra_free" ? "Kulanz aktiv" : "Kulanz geben"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shoots Gallery Dialog (for pixcapture.app jobs) */}
      <Dialog open={showShootsDialog} onOpenChange={setShowShootsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Shoots & Bilder</DialogTitle>
            <DialogDescription>
              Job {shootsData?.job.jobNumber} - {shootsData?.job.propertyName} - {shootsData?.shoots.length || 0} Shoots
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {shootsData?.shoots.map((shoot) => (
              <Card key={shoot.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Shoot {shoot.shootCode}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <Badge variant="outline">{shoot.status}</Badge>
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shoot.images.length} Bilder
                    </p>
                  </div>
                  {shoot.images.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Dateiname</TableHead>
                          <TableHead>Room Type</TableHead>
                          <TableHead>Stack</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shoot.images.slice(0, 10).map((image: any) => (
                          <TableRow key={image.id}>
                            <TableCell className="font-mono text-sm">{image.originalFilename}</TableCell>
                            <TableCell><Badge variant="secondary">{image.roomType || 'unbekannt'}</Badge></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{image.stackId ? '✓' : '−'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Keine Bilder vorhanden</p>
                  )}
                  {shoot.images.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      ... und {shoot.images.length - 10} weitere Bilder
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
            {(!shootsData?.shoots || shootsData.shoots.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">Keine Shoots vorhanden</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Job wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Job{" "}
              <span className="font-semibold">{jobs.find(j => j.id === selectedJobId)?.displayId}</span>
              {" "}und alle zugehörigen Daten werden permanent gelöscht:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Alle Shoots (Fotosessions)</li>
                <li>Alle hochgeladenen Bilder und Stacks</li>
                <li>Exposé-Texte</li>
                <li>Upload-Sitzungen</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={deleteJobMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteJobMutation.isPending ? "Löschen..." : "Job löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
