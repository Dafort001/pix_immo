import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  ArrowLeft,
  Download,
  Send,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  Package,
  ExternalLink,
  ZoomIn,
  Trash2,
  RotateCw,
  Smartphone,
  Camera,
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
import { getGalleryDestination, getPushNotificationConfig } from '../utils/gallery-router';

interface JobImage {
  id: string;
  filename: string;
  url: string;
  thumbnail: string;
  room: string;
  status: 'pending' | 'processed' | 'issue';
  comment?: string;
  selected?: boolean;
}

type UploadSource = 'app' | 'professional';

interface JobDetails {
  jobId: string;
  customer: string;
  property: string;
  uploadDate: string;
  dueDate: string;
  photographer: string;
  source: UploadSource;
  editingNotes: string;
  images: JobImage[];
}

const mockJobDetails: JobDetails = {
  jobId: '20251106-AB123',
  customer: 'Engel & Völkers Hamburg',
  property: 'Elbchaussee 142, 22763 Hamburg',
  uploadDate: '2025-11-06 14:30',
  dueDate: '2025-11-07 18:00',
  photographer: 'Max Müller',
  source: 'app',
  editingNotes: 'Bitte warme Farbkorrektur verwenden. Fenster clear & bright. Sky Swap: Blue Hour.',
  images: [
    {
      id: '1',
      filename: 'PIXIMMO_AB123_WOHNZIMMER_001.jpg',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      room: 'Wohnzimmer',
      status: 'pending',
    },
    {
      id: '2',
      filename: 'PIXIMMO_AB123_WOHNZIMMER_002.jpg',
      url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400',
      room: 'Wohnzimmer',
      status: 'pending',
    },
    {
      id: '3',
      filename: 'PIXIMMO_AB123_KUECHE_001.jpg',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
      room: 'Küche',
      status: 'pending',
    },
    {
      id: '4',
      filename: 'PIXIMMO_AB123_KUECHE_002.jpg',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400',
      room: 'Küche',
      status: 'pending',
    },
    {
      id: '5',
      filename: 'PIXIMMO_AB123_SCHLAFZIMMER_001.jpg',
      url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400',
      room: 'Schlafzimmer',
      status: 'pending',
    },
    {
      id: '6',
      filename: 'PIXIMMO_AB123_BAD_001.jpg',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=2000',
      thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
      room: 'Bad',
      status: 'pending',
    },
  ],
};

export default function EditorJobDetail() {
  const [, setLocation] = useLocation();
  const [jobDetails] = useState<JobDetails>(mockJobDetails);
  const [images, setImages] = useState<JobImage[]>(mockJobDetails.images);
  const [editorComment, setEditorComment] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState<JobImage | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  const selectedCount = images.filter((img) => img.selected).length;
  const allSelected = images.length > 0 && images.every((img) => img.selected);

  const handleToggleAll = () => {
    setImages((prev) => prev.map((img) => ({ ...img, selected: !allSelected })));
  };

  const handleToggleImage = (id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, selected: !img.selected } : img)));
  };

  const handleImageClick = (image: JobImage) => {
    setSelectedImage(image);
    setShowLightbox(true);
  };

  const handleDownloadSelected = () => {
    if (selectedCount === 0) {
      toast.error('Keine Bilder ausgewählt');
      return;
    }
    toast.success(`${selectedCount} Bilder werden heruntergeladen...`);
  };

  const handleMarkAsIssue = (imageId: string) => {
    setImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, status: 'issue' as const } : img))
    );
    toast.success('Bild als problematisch markiert');
  };

  const handleSendQuestion = () => {
    if (!editorComment.trim()) {
      toast.error('Bitte eine Nachricht eingeben');
      return;
    }

    toast.success('Rückfrage an Kunden gesendet', {
      description: 'Der Kunde wurde per Push-Benachrichtigung informiert',
    });
    setEditorComment('');
  };

  const handleDeliverImages = () => {
    const selectedImages = images.filter((img) => img.selected);
    if (selectedImages.length === 0) {
      toast.error('Bitte mindestens ein Bild auswählen');
      return;
    }
    setShowDeliveryDialog(true);
  };

  const confirmDelivery = () => {
    const destination = getGalleryDestination(jobDetails.source, jobDetails.jobId);
    const pushConfig = getPushNotificationConfig(jobDetails.source);
    
    toast.success('Bilder erfolgreich geliefert!', {
      description: `${selectedCount} Bilder → ${destination.type === 'app' ? 'pixcapture.app' : 'pix.immo'} Galerie`,
    });
    
    // Simulate API call to deliver images
    console.log('Delivering to:', destination);
    console.log('Push notification:', pushConfig);
    
    setShowDeliveryDialog(false);
    setTimeout(() => {
      setLocation('/editor-dashboard');
    }, 1500);
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

  const roomGroups = images.reduce((acc, img) => {
    if (!acc[img.room]) acc[img.room] = [];
    acc[img.room].push(img);
    return acc;
  }, {} as Record<string, JobImage[]>);

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead title={`Editor – ${jobDetails.jobId}`} description="Job Details" path="/editor-job-detail" />

      {/* Header */}
      <header className="bg-white border-b border-[#E5E5E5] sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/editor-dashboard')}
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
                    {jobDetails.jobId}
                  </h1>
                  {getSourceBadge(jobDetails.source)}
                </div>
                <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                  {jobDetails.customer} · {jobDetails.property}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadSelected}
                disabled={selectedCount === 0}
                style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif' }}
              >
                <Download className="h-5 w-5 mr-2" />
                Download ({selectedCount})
              </Button>
              <Button
                onClick={handleDeliverImages}
                className="bg-[#64BF49] text-white hover:opacity-90"
                disabled={selectedCount === 0}
                style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
              >
                <Send className="h-5 w-5 mr-2" />
                Bilder liefern ({selectedCount})
              </Button>
            </div>
          </div>

          {/* Job Info Bar */}
          <div className="flex items-center gap-6 text-[#6B7280]" style={{ fontSize: '13pt' }}>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span>{images.length} Bilder</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Upload: {new Date(jobDetails.uploadDate).toLocaleDateString('de-DE')}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>
                Deadline:{' '}
                <span className="text-red-600 font-semibold">
                  {new Date(jobDetails.dueDate).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{jobDetails.photographer}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-[1fr_360px] gap-6 p-6">
          {/* Images Grid */}
          <div className="space-y-6">
            {/* Select All */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Checkbox id="select-all" checked={allSelected} onCheckedChange={handleToggleAll} />
                <label
                  htmlFor="select-all"
                  className="text-[#111111] cursor-pointer"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '15pt' }}
                >
                  Alle auswählen ({images.length} Bilder)
                </label>
              </div>
            </div>

            {/* Editing Notes */}
            {jobDetails.editingNotes && (
              <div className="bg-[#74A4EA]/5 border border-[#74A4EA]/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-[#74A4EA] mt-1" />
                  <div className="flex-1">
                    <h3
                      className="text-[#111111] mb-2"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '15pt' }}
                    >
                      Bearbeitungshinweise
                    </h3>
                    <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                      {jobDetails.editingNotes}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Images by Room */}
            {Object.entries(roomGroups).map(([room, roomImages]) => (
              <div key={room} className="bg-white border border-[#E5E5E5] rounded-lg p-6">
                <h3
                  className="text-[#111111] mb-4"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
                >
                  {room} ({roomImages.length})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {roomImages.map((image) => (
                    <div key={image.id} className="group relative">
                      <div
                        className={`relative aspect-[4/3] rounded-lg overflow-hidden bg-[#F0F0F0] cursor-pointer border-2 transition-all ${
                          image.selected ? 'border-[#64BF49] ring-2 ring-[#64BF49]/20' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                          onClick={() => handleImageClick(image)}
                        />

                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 bg-white/90 hover:bg-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageClick(image);
                              }}
                            >
                              <ZoomIn className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Checkbox
                              checked={image.selected}
                              onCheckedChange={() => handleToggleImage(image.id)}
                              className="bg-white border-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {image.status === 'issue' && (
                            <div className="absolute bottom-2 left-2">
                              <Badge variant="destructive" className="bg-red-500">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Problem
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>

                      <p
                        className="text-[#6B7280] mt-2 truncate text-center"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12pt' }}
                      >
                        {image.filename}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Editor Comment */}
            <div className="bg-white border border-[#E5E5E5] rounded-lg p-6 sticky top-24">
              <h3
                className="text-[#111111] mb-4"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
              >
                Rückfrage an Kunden
              </h3>
              <Textarea
                placeholder="Frage oder Hinweis für den Kunden..."
                value={editorComment}
                onChange={(e) => setEditorComment(e.target.value)}
                className="min-h-[120px] mb-4"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}
              />
              <Button
                onClick={handleSendQuestion}
                className="w-full bg-[#74A4EA] text-white hover:opacity-90"
                disabled={!editorComment.trim()}
                style={{ height: '44px', borderRadius: '0px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Rückfrage senden
              </Button>
              <p className="text-[#999] text-center mt-3" style={{ fontSize: '11pt' }}>
                Kunde erhält Push-Benachrichtigung
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && selectedImage && (
        <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            <div className="relative">
              <img src={selectedImage.url} alt={selectedImage.filename} className="w-full h-auto" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4">
                <p style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>{selectedImage.filename}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delivery Confirmation */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bilder liefern?</DialogTitle>
            <DialogDescription>
              Du bist dabei, {selectedCount} bearbeitete{selectedCount === 1 ? 's' : ''} Bild
              {selectedCount === 1 ? '' : 'er'} an {jobDetails.customer} zu liefern.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Delivery Destination Info */}
            <div className={`${jobDetails.source === 'app' ? 'bg-[#74A4EA]/5 border-[#74A4EA]/20' : 'bg-[#1A1A1C]/5 border-[#1A1A1C]/20'} border rounded-lg p-4`}>
              <div className="flex items-start gap-3 mb-2">
                {jobDetails.source === 'app' ? (
                  <Smartphone className="h-5 w-5 text-[#74A4EA] mt-1" />
                ) : (
                  <Camera className="h-5 w-5 text-[#1A1A1C] mt-1" />
                )}
                <div>
                  <p className="text-[#111111] font-semibold mb-1" style={{ fontSize: '14pt' }}>
                    {jobDetails.source === 'app' ? 'pixcapture.app Galerie' : 'pix.immo Professional Galerie'}
                  </p>
                  <p className="text-[#6B7280]" style={{ fontSize: '12pt' }}>
                    {getGalleryDestination(jobDetails.source, jobDetails.jobId).customerPortal}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#64BF49]/5 border border-[#64BF49]/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#64BF49] mt-1" />
                <div className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                  Der Kunde erhält eine Push-Benachrichtigung und kann die Bilder sofort in seiner Galerie ansehen.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowDeliveryDialog(false)} className="flex-1">
                Abbrechen
              </Button>
              <Button onClick={confirmDelivery} className="flex-1 bg-[#64BF49] text-white hover:opacity-90">
                Jetzt liefern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
