import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Plus, Eye, Trash2, Upload } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from "@/components/AdminLayout";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreatePixJobDialog } from '@/components/CreatePixJobDialog';

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
};

type PixJob = {
  id: string;
  jobNumber: string;
  userId: string;
  source: string;
  customerName?: string;
  propertyName: string;
  propertyAddress?: string;
  status: string;
  createdAt: number;
  deadlineAt?: number;
};

export default function AdminPixJobs() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showShootsDialog, setShowShootsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const { data: pixJobs = [], isLoading: pixJobsLoading } = useQuery<PixJob[]>({
    queryKey: ['/api/pix-jobs'],
  });

  const { data: shootsData } = useQuery<{
    job: { id: string; jobNumber: string; propertyName: string; customerName: string | null };
    shoots: Array<{ id: string; shootCode: string; status: string; createdAt: number; images: any[] }>;
  }>({
    queryKey: ['/api/pix-jobs', selectedJobId, 'shoots-gallery'],
    enabled: !!selectedJobId && showShootsDialog,
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await apiRequest('DELETE', `/api/admin/pix-jobs/${jobId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pix-jobs'] });
      setShowDeleteDialog(false);
      setSelectedJobId(null);
      toast({ title: "Job gelöscht" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Job konnte nicht gelöscht werden",
        variant: "destructive"
      });
    },
  });

  const handleViewShoots = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowShootsDialog(true);
  };

  const handleDeleteJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedJobId) {
      deleteJobMutation.mutate(selectedJobId);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'outline';
      case 'in_progress': return 'default';
      case 'completed': return 'secondary';
      case 'delivered': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'in_progress': return 'In Bearbeitung';
      case 'completed': return 'Fertig';
      case 'delivered': return 'Ausgeliefert';
      default: return status;
    }
  };

  if (authLoading || userLoading) {
    return (
      <AdminLayout userRole={userData?.user?.role || "admin"}>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole={userData?.user?.role || "admin"}>
      <div className="space-y-6">
        <AdminPageHeader
          title="pix.immo Aufträge"
          showBackButton
          actions={
            <Button
              onClick={() => setShowCreateDialog(true)}
              data-testid="button-create-pix-job"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neuer Auftrag
            </Button>
          }
        />

        <Card>
          <CardContent className="p-0">
            {pixJobsLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pixJobs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <p>Keine pix.immo Aufträge vorhanden</p>
                <p className="text-sm mt-2">Klicken Sie auf "Neuer Auftrag" um loszulegen</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job-Nummer</TableHead>
                    <TableHead>Objekt</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Erstellt</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pixJobs.map((job) => (
                    <TableRow key={job.id} data-testid={`row-pix-job-${job.id}`}>
                      <TableCell className="font-mono text-sm">{job.jobNumber}</TableCell>
                      <TableCell className="font-medium">{job.propertyName}</TableCell>
                      <TableCell>{job.customerName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(job.status)}>
                          {getStatusLabel(job.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(job.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(job.deadlineAt)}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/admin/upload-workflow/${job.id}`)}
                          data-testid={`button-upload-workflow-${job.id}`}
                          title="Upload Workflow öffnen"
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewShoots(job.id)}
                          data-testid={`button-view-shoots-${job.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteJob(job.id)}
                          data-testid={`button-delete-${job.id}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create pix.immo Job Dialog */}
        <CreatePixJobDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />

        {/* Shoots Gallery Dialog */}
        <Dialog open={showShootsDialog} onOpenChange={setShowShootsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Shoots & Bilder</DialogTitle>
              <DialogDescription>
                {shootsData?.job.propertyName && `Objekt: ${shootsData.job.propertyName}`}
              </DialogDescription>
            </DialogHeader>

            {shootsData?.shoots && shootsData.shoots.length > 0 ? (
              <div className="space-y-4">
                {shootsData.shoots.map((shoot) => (
                  <Card key={shoot.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-mono text-sm">{shoot.shootCode}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(shoot.createdAt)}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(shoot.status)}>
                          {getStatusLabel(shoot.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {shoot.images.length} Bilder
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                Keine Shoots vorhanden
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Job wirklich löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Shoots und Bilder werden ebenfalls gelöscht.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                data-testid="button-confirm-delete"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
