import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Check,
  X,
  AlertCircle,
  MessageSquare,
  ZoomIn,
  Download,
  Image as ImageIcon,
  Smartphone,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  getAvailableEditors, 
  autoAssignEditor, 
  getEditorById,
  Editor,
} from '../utils/editor-assignment';

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
  selected?: boolean;
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

const mockJob: QCJob = {
  jobId: '20251106-AB123',
  customer: 'Engel & Völkers Hamburg',
  property: 'Elbchaussee 142, 22763 Hamburg',
  source: 'app',
  uploadDate: '2025-11-06 14:30',
  photographer: 'Max Müller (App-Upload)',
  images: [
    {
      id: '1',
      filename: 'PIXIMMO_AB123_WOHNZIMMER_001.jpg',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      room: 'Wohnzimmer',
      status: 'pending',
      source: 'app',
      metadata: {
        resolution: '6000 × 4000 px',
        fileSize: '8.4 MB',
        iso: '400',
        aperture: 'f/2.8',
        shutterSpeed: '1/60',
      },
    },
    {
      id: '2',
      filename: 'PIXIMMO_AB123_WOHNZIMMER_002.jpg',
      url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400',
      room: 'Wohnzimmer',
      status: 'pending',
      source: 'app',
      technicalIssues: ['Unterbelichtet', 'Weißabgleich inkorrekt'],
      metadata: {
        resolution: '6000 × 4000 px',
        fileSize: '7.9 MB',
        iso: '800',
        aperture: 'f/2.8',
        shutterSpeed: '1/30',
      },
    },
    {
      id: '3',
      filename: 'PIXIMMO_AB123_KUECHE_001.jpg',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
      room: 'Küche',
      status: 'approved',
      source: 'app',
      metadata: {
        resolution: '6000 × 4000 px',
        fileSize: '8.1 MB',
        iso: '200',
        aperture: 'f/4.0',
        shutterSpeed: '1/125',
      },
    },
    {
      id: '4',
      filename: 'PIXIMMO_AB123_BAD_001.jpg',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
      room: 'Bad',
      status: 'rejected',
      source: 'app',
      comment: 'Starke Fensterreflexion - bitte mit Polarisationsfilter neu aufnehmen',
      technicalIssues: ['Reflexionen', 'Perspektivkorrektur fehlt'],
      metadata: {
        resolution: '6000 × 4000 px',
        fileSize: '7.5 MB',
      },
    },
  ],
};

export default function QCQualityCheck() {
  const [, setLocation] = useLocation();
  const [job] = useState<QCJob>(mockJob);
  const [images, setImages] = useState<QCImage[]>(mockJob.images);
  const [selectedImage, setSelectedImage] = useState<QCImage | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [qcComment, setQcComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<QCStatus | 'all'>('all');
  const [showApprovedImages, setShowApprovedImages] = useState(true);
  const [showEditorAssignment, setShowEditorAssignment] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<string>('auto');
  
  const availableEditors = getAvailableEditors({ source: job.source });

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
    toast.success('Bild freigegeben');
  };

  const handleReject = (imageId: string, comment: string) => {
    if (!comment.trim()) {
      toast.error('Bitte Ablehnungsgrund angeben');
      return;
    }
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'rejected' as QCStatus, comment } : img))
    );
    toast.success('Bild abgelehnt', {
      description: 'Fotograf wird benachrichtigt',
    });
    setQcComment('');
  };

  const handleNeedsRevision = (imageId: string, comment: string) => {
    if (!comment.trim()) {
      toast.error('Bitte Revisionsgrund angeben');
      return;
    }
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'needs-revision' as QCStatus, comment } : img))
    );
    toast.success('Revision angefordert', {
      description: 'Editor wird benachrichtigt',
    });
    setQcComment('');
  };

  const handleBulkApprove = () => {
    const pendingImages = images.filter((img) => img.status === 'pending');
    if (pendingImages.length === 0) {
      toast.error('Keine ausstehenden Bilder');
      return;
    }
    setImages((prev) => prev.map((img) => (img.status === 'pending' ? { ...img, status: 'approved' as QCStatus } : img)));
    toast.success(`${pendingImages.length} Bilder freigegeben`);
  };

  const handleSendToEditor = () => {
    const approvedImages = images.filter((img) => img.status === 'approved');
    if (approvedImages.length === 0) {
      toast.error('Keine freigegebenen Bilder');
      return;
    }
    setShowEditorAssignment(true);
  };

  const confirmEditorAssignment = () => {
    const approvedImages = images.filter((img) => img.status === 'approved');
    
    let assignedEditor: Editor | null = null;
    
    if (selectedEditor === 'auto') {
      assignedEditor = autoAssignEditor(job.jobId, job.source, 'normal', approvedImages.length);
    } else {
      assignedEditor = getEditorById(selectedEditor) || null;
    }
    
    if (assignedEditor) {
      toast.success(`Job zugewiesen an ${assignedEditor.name}`, {
        description: `${approvedImages.length} Bilder → ${assignedEditor.name} (${assignedEditor.avgTurnaroundHours}h avg.)`,
      });
    } else {
      toast.error('Editor-Zuweisung fehlgeschlagen');
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
    const styles = {
      pending: 'bg-[#C9B55A]/10 text-[#C9B55A] border-[#C9B55A]/20',
      approved: 'bg-[#64BF49]/10 text-[#64BF49] border-[#64BF49]/20',
      rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
      'needs-revision': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };

    const labels = {
      pending: 'Ausstehend',
      approved: 'Freigegeben',
      rejected: 'Abgelehnt',
      'needs-revision': 'Revision',
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getSourceBadge = (source: UploadSource) => {
    return source === 'app' ? (
      <Badge variant="outline" className="bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20">
        <Smartphone className="h-3 w-3 mr-1" />
        App-Upload
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-[#1A1A1C]/10 text-[#1A1A1C] border-[#1A1A1C]/20">
        <Camera className="h-3 w-3 mr-1" />
        Professional
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead title={`Quality Check – ${job.jobId}`} description="Bildqualitätsprüfung" path="/qc-quality-check" />

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/eingegangene-uploads')}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1
                    className="text-[#111111]"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700, fontSize: '24pt' }}
                  >
                    Quality Check · {job.jobId}
                  </h1>
                  {getSourceBadge(job.source)}
                </div>
                <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                  {job.customer} · {job.property}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleBulkApprove}
                disabled={stats.pending === 0}
                style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Alle freigeben ({stats.pending})
              </Button>
              <Button
                onClick={handleSendToEditor}
                disabled={stats.approved === 0}
                className="bg-[#64BF49] text-white hover:opacity-90"
                style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
              >
                <Send className="h-5 w-5 mr-2" />
                An Editor senden ({stats.approved})
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#C9B55A]" />
              <span className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                {stats.pending} ausstehend
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#64BF49]" />
              <span className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                {stats.approved} freigegeben
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                {stats.rejected} abgelehnt
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                {stats.needsRevision} Revision
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-[104px] z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[200px] h-10">
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
                />
                <label
                  htmlFor="show-approved"
                  className="text-[#6B7280] cursor-pointer"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13pt' }}
                >
                  Freigegebene anzeigen
                </label>
              </div>
            </div>

            <p className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
              {filteredImages.length} von {images.length} Bildern
            </p>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div key={image.id} className="group relative">
              <div
                className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F0F0F0] cursor-pointer border-2 transition-all ${
                  image.status === 'approved'
                    ? 'border-[#64BF49] opacity-60'
                    : image.status === 'rejected'
                    ? 'border-red-500'
                    : image.status === 'needs-revision'
                    ? 'border-orange-500'
                    : 'border-transparent'
                }`}
                onClick={() => handleImageClick(image)}
              >
                <img src={image.thumbnail} alt={image.filename} className="w-full h-full object-cover" />

                {/* Status Badge */}
                <div className="absolute top-2 left-2">{getStatusBadge(image.status)}</div>

                {/* Technical Issues */}
                {image.technicalIssues && image.technicalIssues.length > 0 && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="bg-red-500">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {image.technicalIssues.length}
                    </Badge>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(image);
                    }}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  {image.status === 'pending' && (
                    <>
                      <Button
                        size="icon"
                        className="bg-[#64BF49] hover:opacity-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(image.id);
                        }}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <p
                className="text-[#6B7280] mt-2 truncate text-center"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '11pt' }}
              >
                {image.room}
              </p>
              <p
                className="text-[#999] truncate text-center"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '10pt' }}
              >
                {image.filename}
              </p>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="h-16 w-16 text-[#E5E5E5] mx-auto mb-4" />
            <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16pt' }}>
              Keine Bilder gefunden
            </p>
          </div>
        )}
      </main>

      {/* Lightbox */}
      {showLightbox && selectedImage && (
        <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
            <div className="grid grid-cols-[1fr_400px] h-[90vh]">
              {/* Image */}
              <div className="relative bg-black flex items-center justify-center">
                <img src={selectedImage.url} alt={selectedImage.filename} className="max-w-full max-h-full object-contain" />
              </div>

              {/* QC Panel */}
              <div className="bg-white p-6 overflow-y-auto">
                <h3
                  className="text-[#111111] mb-4"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
                >
                  Quality Check
                </h3>

                {/* Status */}
                <div className="mb-4">{getStatusBadge(selectedImage.status)}</div>

                {/* Metadata */}
                <div className="space-y-2 mb-6 text-[13pt] text-[#6B7280]">
                  <p>
                    <strong>Datei:</strong> {selectedImage.filename}
                  </p>
                  <p>
                    <strong>Raum:</strong> {selectedImage.room}
                  </p>
                  <p>
                    <strong>Auflösung:</strong> {selectedImage.metadata.resolution}
                  </p>
                  <p>
                    <strong>Größe:</strong> {selectedImage.metadata.fileSize}
                  </p>
                  {selectedImage.metadata.iso && (
                    <p>
                      <strong>ISO:</strong> {selectedImage.metadata.iso}
                    </p>
                  )}
                  {selectedImage.metadata.aperture && (
                    <p>
                      <strong>Blende:</strong> {selectedImage.metadata.aperture}
                    </p>
                  )}
                  {selectedImage.metadata.shutterSpeed && (
                    <p>
                      <strong>Belichtung:</strong> {selectedImage.metadata.shutterSpeed}
                    </p>
                  )}
                </div>

                {/* Technical Issues */}
                {selectedImage.technicalIssues && selectedImage.technicalIssues.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <p
                        className="text-red-900"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '14pt' }}
                      >
                        Technische Probleme:
                      </p>
                    </div>
                    <ul className="list-disc list-inside text-red-700 text-[13pt]">
                      {selectedImage.technicalIssues.map((issue, idx) => (
                        <li key={idx}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Comment */}
                {selectedImage.comment && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p
                      className="text-orange-900"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13pt' }}
                    >
                      <strong>Kommentar:</strong> {selectedImage.comment}
                    </p>
                  </div>
                )}

                {/* QC Comment Input */}
                <div className="mb-6">
                  <label
                    className="block text-[#111111] mb-2"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '14pt' }}
                  >
                    Kommentar / Ablehnungsgrund
                  </label>
                  <Textarea
                    placeholder="Grund für Ablehnung oder Revision angeben..."
                    value={qcComment}
                    onChange={(e) => setQcComment(e.target.value)}
                    className="min-h-[100px]"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13pt' }}
                  />
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {selectedImage.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleApprove(selectedImage.id)}
                        className="w-full bg-[#64BF49] text-white hover:opacity-90"
                        style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
                      >
                        <Check className="h-5 w-5 mr-2" />
                        Freigeben
                      </Button>
                      <Button
                        onClick={() => handleNeedsRevision(selectedImage.id, qcComment)}
                        variant="outline"
                        className="w-full"
                        style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Revision anfordern
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedImage.id, qcComment)}
                        variant="destructive"
                        className="w-full"
                        style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif' }}
                      >
                        <X className="h-5 w-5 mr-2" />
                        Ablehnen
                      </Button>
                    </>
                  )}

                  {selectedImage.status === 'approved' && (
                    <div className="text-center p-4 bg-[#64BF49]/5 border border-[#64BF49]/20 rounded-lg">
                      <CheckCircle2 className="h-12 w-12 text-[#64BF49] mx-auto mb-2" />
                      <p className="text-[#64BF49]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                        Bild freigegeben
                      </p>
                    </div>
                  )}

                  {selectedImage.status === 'rejected' && (
                    <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                      <p className="text-red-600" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}>
                        Bild abgelehnt
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Editor Assignment Dialog */}
      <Dialog open={showEditorAssignment} onOpenChange={setShowEditorAssignment}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editor zuweisen</DialogTitle>
            <DialogDescription>
              Wähle einen Editor für diesen Job oder nutze die Auto-Zuweisung basierend auf Verfügbarkeit und Spezialisierung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-[#111111] mb-2 font-semibold" style={{ fontSize: '14pt' }}>
                Editor auswählen
              </label>
              <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">🤖 Auto-Assign (empfohlen)</SelectItem>
                  {availableEditors.map((editor) => (
                    <SelectItem key={editor.id} value={editor.id}>
                      {editor.name} · {editor.currentJobs}/{editor.maxJobs} Jobs · {editor.avgTurnaroundHours}h avg.
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Editor Info */}
            {selectedEditor === 'auto' ? (
              <div className="bg-[#74A4EA]/5 border border-[#74A4EA]/20 rounded-lg p-4">
                <p className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                  🤖 <strong>Auto-Assign</strong> wählt automatisch den besten verfügbaren Editor basierend auf:
                </p>
                <ul className="list-disc list-inside text-[#6B7280] mt-2 ml-2" style={{ fontSize: '12pt' }}>
                  <li>Aktuelle Auslastung</li>
                  <li>Qualitätsscore</li>
                  <li>Durchschnittliche Bearbeitungszeit</li>
                  <li>Spezialisierung ({job.source === 'app' ? 'App' : 'Professional'})</li>
                </ul>
              </div>
            ) : (
              (() => {
                const editor = getEditorById(selectedEditor);
                if (!editor) return null;
                return (
                  <div className="bg-[#64BF49]/5 border border-[#64BF49]/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#64BF49] to-[#74A4EA] flex items-center justify-center text-white text-[14pt] font-bold">
                        {editor.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[#111111]" style={{ fontSize: '14pt' }}>
                          {editor.name}
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-2 text-[12pt] text-[#6B7280]">
                          <div>
                            <p className="font-semibold">Workload</p>
                            <p>{editor.currentJobs}/{editor.maxJobs}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Qualität</p>
                            <p>{editor.qualityScore}%</p>
                          </div>
                          <div>
                            <p className="font-semibold">Avg. Zeit</p>
                            <p>{editor.avgTurnaroundHours}h</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowEditorAssignment(false)} className="flex-1">
                Abbrechen
              </Button>
              <Button
                onClick={confirmEditorAssignment}
                className="flex-1 bg-[#64BF49] text-white hover:opacity-90"
                style={{ borderRadius: '0px' }}
              >
                Zuweisen & Senden
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
