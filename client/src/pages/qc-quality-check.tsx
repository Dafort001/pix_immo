import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { getQueryFn } from "@/lib/queryClient";
import {
  Check,
  X,
  AlertCircle,
  ZoomIn,
  Image as ImageIcon,
  Smartphone,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLayout } from "@/components/AdminLayout";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  getAvailableEditors, 
  autoAssignEditor, 
  getEditorById,
  Editor,
} from '@/utils/editor-assignment';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

type UploadSource = 'app' | 'professional';
type QCStatus = 'pending' | 'approved' | 'rejected' | 'needs-revision';

interface QCImage {
  id: string;
  filename: string;
  url: string;
  thumbnail: string;
  room: string;
  status: QCStatus;
  source: UploadSource;
  comment?: string;
  technicalIssues?: string[];
  metadata: {
    resolution: string;
    fileSize: string;
    iso?: string;
    aperture?: string;
    shutterSpeed?: string;
  };
}

interface QCJob {
  jobId: string;
  customer: string;
  property: string;
  source: UploadSource;
  uploadDate: string;
  photographer?: string;
  images: QCImage[];
}

export default function QCQualityCheck() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const [, setLocation] = useLocation();
  const [job, setJob] = useState<QCJob | null>(null);
  const [images, setImages] = useState<QCImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<QCImage | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [qcComment, setQcComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<QCStatus | 'all'>('all');
  const [showApprovedImages, setShowApprovedImages] = useState(true);
  const [showEditorAssignment, setShowEditorAssignment] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<string>('auto');
  const { toast } = useToast();
  
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });
  
  const availableEditors = job ? getAvailableEditors({ source: job.source }) : [];

  const stats = {
    pending: images.filter((img) => img.status === 'pending').length,
    approved: images.filter((img) => img.status === 'approved').length,
    rejected: images.filter((img) => img.status === 'rejected').length,
    needsRevision: images.filter((img) => img.status === 'needs-revision').length,
  };

  const filteredImages = images.filter((img) => {
    const matchesStatus = filterStatus === 'all' || img.status === filterStatus;
    const matchesVisibility = showApprovedImages || img.status !== 'approved';
    return matchesStatus && matchesVisibility;
  });

  const handleApprove = (imageId: string) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, status: 'approved' as QCStatus } : img)));
    toast({
      title: "Bild freigegeben",
      description: "Das Bild wurde erfolgreich freigegeben",
    });
  };

  const handleReject = (imageId: string, comment: string) => {
    if (!comment.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte Ablehnungsgrund angeben",
        variant: "destructive",
      });
      return;
    }
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'rejected' as QCStatus, comment } : img))
    );
    toast({
      title: "Bild abgelehnt",
      description: "Fotograf wird benachrichtigt",
    });
    setQcComment('');
  };

  const handleNeedsRevision = (imageId: string, comment: string) => {
    if (!comment.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte Revisionsgrund angeben",
        variant: "destructive",
      });
      return;
    }
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'needs-revision' as QCStatus, comment } : img))
    );
    toast({
      title: "Revision angefordert",
      description: "Editor wird benachrichtigt",
    });
    setQcComment('');
  };

  const handleBulkApprove = () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    if (pendingImages.length === 0) {
      toast({
        title: "Fehler",
        description: "Keine ausstehenden Bilder",
        variant: "destructive",
      });
      return;
    }
    setImages((prev) => prev.map((img) => (img.status === 'pending' ? { ...img, status: 'approved' as QCStatus } : img)));
    toast({
      title: "Erfolgreich",
      description: `${pendingImages.length} Bilder freigegeben`,
    });
  };

  const handleSendToEditor = () => {
    const approvedImages = images.filter((img) => img.status === 'approved');
    if (approvedImages.length === 0) {
      toast({
        title: "Fehler",
        description: "Keine freigegebenen Bilder",
        variant: "destructive",
      });
      return;
    }
    setShowEditorAssignment(true);
  };

  const confirmEditorAssignment = () => {
    if (!job) return;
    
    const approvedImages = images.filter((img) => img.status === 'approved');
    
    let assignedEditor: Editor | null = null;
    
    if (selectedEditor === 'auto') {
      assignedEditor = autoAssignEditor(job.jobId, job.source, 'normal', approvedImages.length);
    } else {
      assignedEditor = getEditorById(selectedEditor) || null;
    }
    
    if (assignedEditor) {
      toast({
        title: `Job zugewiesen an ${assignedEditor.name}`,
        description: `${approvedImages.length} Bilder → ${assignedEditor.name} (${assignedEditor.avgTurnaroundHours}h avg.)`,
      });
    } else {
      toast({
        title: "Fehler",
        description: "Editor-Zuweisung fehlgeschlagen",
        variant: "destructive",
      });
    }
    
    setShowEditorAssignment(false);
    setTimeout(() => {
      setLocation('/editor-dashboard');
    }, 1500);
  };

  const handleImageClick = (image: QCImage) => {
    setSelectedImage(image);
    setQcComment(image.comment || '');
    setShowLightbox(true);
  };

  const getStatusBadge = (status: QCStatus) => {
    const variants: Record<QCStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: 'Ausstehend', variant: 'secondary' },
      approved: { label: 'Freigegeben', variant: 'default' },
      rejected: { label: 'Abgelehnt', variant: 'destructive' },
      'needs-revision': { label: 'Revision', variant: 'outline' },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const getSourceBadge = (source: UploadSource) => {
    return source === 'app' ? (
      <Badge variant="outline">
        <Smartphone className="h-3 w-3 mr-1" />
        App-Upload
      </Badge>
    ) : (
      <Badge variant="secondary">
        <Camera className="h-3 w-3 mr-1" />
        Professional
      </Badge>
    );
  };

  if (authLoading || userLoading) return null;
  if (!userData) return null;

  if (!job) {
    return (
      <AdminLayout userRole={userData.user.role}>
        <div className="flex flex-col h-full">
          <AdminPageHeader title="Quality Check" showBackButton />
          
          <div className="flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <ImageIcon className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-lg font-semibold mb-2">
                Kein Job ausgewählt
              </h2>
              <p className="text-muted-foreground mb-6">
                Wähle einen Job aus, um die Bildqualität zu prüfen
              </p>
              <Button onClick={() => setLocation('/dashboard')}>
                Zum Dashboard
              </Button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole={userData.user.role}>
      <div className="flex flex-col h-full">
        <AdminPageHeader 
          title={`Quality Check · ${job.jobId}`}
          showBackButton
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBulkApprove}
                disabled={stats.pending === 0}
                data-testid="button-bulk-approve"
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Alle freigeben ({stats.pending})
              </Button>
              <Button
                onClick={handleSendToEditor}
                disabled={stats.approved === 0}
                data-testid="button-send-to-editor"
              >
                <Send className="h-5 w-5 mr-2" />
                An Editor senden ({stats.approved})
              </Button>
            </div>
          }
        />

        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-muted-foreground">
                {job.customer} · {job.property}
              </span>
              {getSourceBadge(job.source)}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {stats.pending} ausstehend
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {stats.approved} freigegeben
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {stats.rejected} abgelehnt
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">
                  {stats.needsRevision} Revision
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b bg-card">
          <div className="max-w-6xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-[200px]" data-testid="filter-status">
                    <SelectValue placeholder="Status filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="approved">Freigegeben</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                    <SelectItem value="needs-revision">Revision</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="show-approved"
                    checked={showApprovedImages}
                    onCheckedChange={(checked) => setShowApprovedImages(checked as boolean)}
                    data-testid="checkbox-show-approved"
                  />
                  <label htmlFor="show-approved" className="text-muted-foreground cursor-pointer text-sm">
                    Freigegebene anzeigen
                  </label>
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                {filteredImages.length} von {images.length} Bildern
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="group relative" data-testid={`image-card-${image.id}`}>
                  <div
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted cursor-pointer border-2 transition-all hover:border-border"
                    onClick={() => handleImageClick(image)}
                  >
                    <img src={image.thumbnail} alt={image.filename} className="w-full h-full object-cover" />

                    <div className="absolute top-2 left-2">{getStatusBadge(image.status)}</div>

                    {image.technicalIssues && image.technicalIssues.length > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {image.technicalIssues.length}
                        </Badge>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                        data-testid={`button-zoom-${image.id}`}
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      {image.status === 'pending' && (
                        <>
                          <Button
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(image.id);
                            }}
                            data-testid={`button-approve-${image.id}`}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(image);
                            }}
                            data-testid={`button-reject-${image.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-2 truncate text-center text-sm">
                    {image.room}
                  </p>
                  <p className="text-muted-foreground truncate text-center text-xs opacity-60">
                    {image.filename}
                  </p>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Bilder gefunden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLightbox && selectedImage && (
        <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
            <div className="grid grid-cols-[1fr_400px] h-[90vh]">
              <div className="relative bg-black flex items-center justify-center">
                <img src={selectedImage.url} alt={selectedImage.filename} className="max-w-full max-h-full object-contain" />
              </div>

              <div className="bg-card p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">
                  Quality Check
                </h3>

                <div className="mb-4">{getStatusBadge(selectedImage.status)}</div>

                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Datei:</strong> {selectedImage.filename}</p>
                  <p><strong className="text-foreground">Raum:</strong> {selectedImage.room}</p>
                  <p><strong className="text-foreground">Auflösung:</strong> {selectedImage.metadata.resolution}</p>
                  <p><strong className="text-foreground">Größe:</strong> {selectedImage.metadata.fileSize}</p>
                  {selectedImage.metadata.iso && <p><strong className="text-foreground">ISO:</strong> {selectedImage.metadata.iso}</p>}
                  {selectedImage.metadata.aperture && <p><strong className="text-foreground">Blende:</strong> {selectedImage.metadata.aperture}</p>}
                  {selectedImage.metadata.shutterSpeed && <p><strong className="text-foreground">Belichtung:</strong> {selectedImage.metadata.shutterSpeed}</p>}
                </div>

                {selectedImage.technicalIssues && selectedImage.technicalIssues.length > 0 && (
                  <div className="mb-6 p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                      <p className="text-destructive font-semibold">Technische Probleme:</p>
                    </div>
                    <ul className="list-disc list-inside text-destructive/90 text-sm">
                      {selectedImage.technicalIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedImage.comment && (
                  <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm">
                      <strong>Kommentar:</strong> {selectedImage.comment}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block font-semibold mb-2 text-sm">
                    Kommentar / Ablehnungsgrund
                  </label>
                  <Textarea
                    placeholder="Grund für Ablehnung oder Revision angeben..."
                    value={qcComment}
                    onChange={(e) => setQcComment(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-qc-comment"
                  />
                </div>

                {selectedImage.status === 'pending' && (
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleApprove(selectedImage.id);
                        setShowLightbox(false);
                      }}
                      className="flex-1"
                      data-testid="button-approve-lightbox"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Freigeben
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleNeedsRevision(selectedImage.id, qcComment);
                        setShowLightbox(false);
                      }}
                      className="flex-1"
                      data-testid="button-needs-revision"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Revision
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleReject(selectedImage.id, qcComment);
                        setShowLightbox(false);
                      }}
                      className="flex-1"
                      data-testid="button-reject-lightbox"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Ablehnen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showEditorAssignment && job && (
        <Dialog open={showEditorAssignment} onOpenChange={setShowEditorAssignment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editor zuweisen</DialogTitle>
              <DialogDescription>
                {stats.approved} freigegebene Bilder an Editor zuweisen
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                <SelectTrigger data-testid="select-editor">
                  <SelectValue placeholder="Editor auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🤖 Automatische Zuweisung</SelectItem>
                  {availableEditors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name} ({editor.currentJobs}/{editor.maxJobs} Jobs)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowEditorAssignment(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button onClick={confirmEditorAssignment} className="flex-1" data-testid="button-confirm-assignment">
                  Zuweisen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
