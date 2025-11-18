import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from 'wouter';
import { SEOHead } from '@shared/components';
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import {
  Download,
  Check,
  Edit3,
  Eye,
  Share2,
  Trash2,
  ZoomIn,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Copy,
  Image as ImageIcon,
  Undo2,
  Redo2,
  MessageSquare,
  Calendar,
  Link as LinkIcon,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Play,
  Film,
} from 'lucide-react';
import { mockGalleryImages, type GalleryImage, type GalleryImageStatus } from '@shared/gallery-images';
import { AnnotationOverlay } from '@/components/gallery/annotation-overlay';
import { Heart, Send } from 'lucide-react';

// Types for API integration
type Comment = {
  id: string;
  comment: string;
  altText: string | null;
  createdAt: number;
  userId: string;
  userEmail: string;
};

// Helper function for aspect ratio classes (Masonry Layout)
function getAspectRatioClass(aspectRatio?: string) {
  switch (aspectRatio) {
    case '2:3':
      return 'aspect-[2/3]';
    case '16:9':
      return 'aspect-[16/9]';
    case '9:16':
      return 'aspect-[9/16]';
    case '1:1':
      return 'aspect-square';
    case '3:2':
      return 'aspect-[3/2]';
    default:
      return 'aspect-[4/3]'; // Default für Landscape
  }
}

export default function Galerie() {
  const [, setLocation] = useLocation();
  
  // Job/Order Information
  const jobInfo = {
    jobNumber: 'JOB-2024-1847',
    address: 'Musterstraße 123, 22767 Hamburg',
    useAddress: true // Toggle: true = Adresse anzeigen, false = Jobnummer anzeigen
  };
  
  const pageTitle = jobInfo.useAddress ? jobInfo.address : jobInfo.jobNumber;
  
  const [images, setImages] = useState<GalleryImage[]>(mockGalleryImages);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GalleryImageStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [isPaidUser, setIsPaidUser] = useState(false); // Mock: Toggle für Demo
  
  // Package Limit State
  const [packageLimit, setPackageLimit] = useState(15); // Bilder im Paket enthalten
  const [extraImagePrice, setExtraImagePrice] = useState(4); // € pro Zusatzbild
  const [costOverviewOpen, setCostOverviewOpen] = useState(false);
  
  // Drawers & Dialogs
  const [annotationOpen, setAnnotationOpen] = useState(false);
  const [currentAnnotationImage, setCurrentAnnotationImage] = useState<GalleryImage | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [shareLinkDialogOpen, setShareLinkDialogOpen] = useState(false);
  const [kiEditorOpen, setKiEditorOpen] = useState(false);
  const [currentKiImage, setCurrentKiImage] = useState<GalleryImage | null>(null);
  const [versionCompareOpen, setVersionCompareOpen] = useState(false);
  const [currentCompareImage, setCurrentCompareImage] = useState<GalleryImage | null>(null);
  
  // KI Editor Zoom
  const [kiZoom, setKiZoom] = useState(100);
  
  // CRM Export Dialog
  const [crmExportOpen, setCrmExportOpen] = useState(false);
  const [crmSystem, setCrmSystem] = useState<'fio' | 'onoffice' | 'propstack' | 'csv'>('csv');
  const [useStreetAsTitle, setUseStreetAsTitle] = useState(false);
  const [exportLink, setExportLink] = useState('');
  const [objectTitle, setObjectTitle] = useState(jobInfo.address);
  
  // Lightbox Dialog
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  
  // Share Link
  const [shareLinkType, setShareLinkType] = useState<'view' | 'view-download' | 'view-select'>('view');
  const [shareLinkExpiry, setShareLinkExpiry] = useState('7');
  const [shareLinkPin, setShareLinkPin] = useState('');
  const [shareLinkWatermark, setShareLinkWatermark] = useState(false);
  const [generatedShareLink, setGeneratedShareLink] = useState('');

  // Comments State
  const [newComment, setNewComment] = useState("");
  const [newAltText, setNewAltText] = useState("");

  // API Queries for Favorites and Comments
  const { data: favoritesData } = useQuery<{ favorites: string[] }>({
    queryKey: ["/api/favorites"],
    queryFn: getQueryFn<{ favorites: string[] }>({ on401: "returnNull" }),
  });

  const { data: commentsData } = useQuery<{ comments: Comment[] }>({
    queryKey: ["/api/image", lightboxImage?.id, "comments"],
    queryFn: getQueryFn<{ comments: Comment[] }>({ on401: "returnNull" }),
    enabled: !!lightboxImage,
  });

  const favorites = favoritesData?.favorites || [];
  const comments = commentsData?.comments || [];

  // Favoriten-Toggle Mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return await apiRequest("POST", `/api/image/${imageId}/favorite`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast.success("Favorit aktualisiert");
    },
    onError: () => {
      toast.error("Favorit konnte nicht aktualisiert werden");
    },
  });

  // Kommentar hinzufügen Mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ imageId, comment, altText }: { imageId: string; comment: string; altText?: string }) => {
      return await apiRequest("POST", `/api/image/${imageId}/comment`, { comment, altText });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/image", variables.imageId, "comments"] });
      setNewComment("");
      setNewAltText("");
      toast.success("Kommentar hinzugefügt");
    },
    onError: () => {
      toast.error("Kommentar konnte nicht hinzugefügt werden");
    },
  });

  // Toggle Favorit Handler
  const handleToggleFavorite = (imageId: string) => {
    toggleFavoriteMutation.mutate(imageId);
  };

  // Add Comment Handler
  const handleAddComment = () => {
    if (!lightboxImage) return;
    if (!newComment.trim()) {
      toast.error("Bitte geben Sie einen Kommentar ein");
      return;
    }
    addCommentMutation.mutate({
      imageId: lightboxImage.id,
      comment: newComment,
      altText: newAltText || undefined,
    });
  };

  // Filter & Sort
  const filteredImages = images
    .filter(img => {
      const matchesSearch = 
        img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.roomType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.altText?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || img.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      if (sortBy === 'name') return a.filename.localeCompare(b.filename);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  // Lightbox Functions
  const openLightbox = (image: GalleryImage) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setLightboxImage(image);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };
  
  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? lightboxIndex - 1 : lightboxIndex + 1;
    if (newIndex >= 0 && newIndex < filteredImages.length) {
      setLightboxIndex(newIndex);
      setLightboxImage(filteredImages[newIndex]);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, lightboxIndex, filteredImages]);

  // Selection
  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedImages);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedImages(newSelection);
  };

  const selectAll = () => {
    setSelectedImages(new Set(filteredImages.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  // Actions
  const handleApprove = (imageIds: string[]) => {
    setImages(prev => prev.map(img => 
      imageIds.includes(img.id) ? { ...img, status: 'freigegeben' as GalleryImageStatus } : img
    ));
    toast.success(`${imageIds.length} Bild(er) freigegeben`);
    setApprovalDialogOpen(false);
    clearSelection();
  };

  const handleRequestChange = (image: GalleryImage) => {
    setCurrentAnnotationImage(image);
    setAnnotationOpen(true);
  };

  const handleAnnotationSave = (annotationData: string) => {
    if (!currentAnnotationImage) return;
    
    const ticketId = `TICKET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setImages(prev => prev.map(img => 
      img.id === currentAnnotationImage.id 
        ? { ...img, status: 'korrektur' as GalleryImageStatus, annotationData }
        : img
    ));
    
    toast.success(`Änderungsauftrag ${ticketId} erstellt`);
    setAnnotationOpen(false);
    setCurrentAnnotationImage(null);
  };

  const handleDownload = (imageIds: string[]) => {
    const count = imageIds.length;
    toast.success(`${count} Bild(er) werden heruntergeladen...`);
    // Mock download
  };

  const handleExportAltTexts = (imageIds: string[]) => {
    const selectedImgs = images.filter(img => imageIds.includes(img.id));
    const hasAltTexts = selectedImgs.some(img => img.altText);
    
    if (!hasAltTexts) {
      toast.error('Keine ALT-Texte vorhanden');
      return;
    }
    
    toast.success('ALT-Texte als JSON exportiert');
    // Mock export
  };

  const handleKiEdit = (image: GalleryImage) => {
    // Navigate to AI Lab with image data
    const params = new URLSearchParams({
      imageUrl: image.url,
      filename: image.filename,
      imageId: image.id,
    });
    setLocation(`/ai-lab?${params.toString()}`);
  };

  const handleKiSave = () => {
    if (!currentKiImage) return;
    
    const newVersion = (currentKiImage.version || 1) + 1;
    setImages(prev => prev.map(img => 
      img.id === currentKiImage.id 
        ? { 
            ...img, 
            version: newVersion, 
            status: 'zur-pruefung' as GalleryImageStatus,
            versions: [
              ...(img.versions || []),
              { version: newVersion, url: img.url, date: new Date().toISOString().split('T')[0], aiEdited: true }
            ]
          }
        : img
    ));
    
    toast.success(`Version ${newVersion} (KI-bearbeitet) gespeichert`);
    setKiEditorOpen(false);
  };

  const handleGenerateShareLink = () => {
    const selectedIds = Array.from(selectedImages);
    if (selectedIds.length === 0) {
      toast.error('Bitte wählen Sie mindestens ein Bild aus');
      return;
    }
    
    const mockLink = `https://pix.immo/share/${Math.random().toString(36).substr(2, 12)}`;
    setGeneratedShareLink(mockLink);
    toast.success('Share-Link generiert');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('In Zwischenablage kopiert');
  };

  // Package Limit Calculations
  const totalImages = images.length;
  const extraImages = Math.max(0, totalImages - packageLimit);
  const packageProgress = Math.min(100, (totalImages / packageLimit) * 100);
  const extraImageCost = extraImages * extraImagePrice;
  
  // CRM Export Functions
  const validateExport = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!objectTitle.trim()) {
      errors.push('Bitte Objektbezeichnung setzen');
    }
    
    const primaryImages = images.filter((_, index) => index === 0); // Mock: erstes Bild ist primary
    if (primaryImages.length !== 1) {
      errors.push('Genau ein Hauptbild (is_primary=1) erforderlich');
    }
    
    // Mock: Sequenz prüfen (1..n)
    const sequences = images.map((_, i) => i + 1);
    const hasGaps = sequences.some((seq, i) => seq !== i + 1);
    if (hasGaps) {
      errors.push('Sequenz lückenlos 1..n');
    }
    
    return { valid: errors.length === 0, errors };
  };
  
  const handleCrmExport = () => {
    const validation = validateExport();
    
    if (!validation.valid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }
    
    // Optional: Warnung für fehlende Adresse/Koordinaten
    if (!objectTitle.includes(',') || objectTitle.split(',').length < 2) {
      toast('Adresse/Koordinaten fehlen (optional)', {
        description: 'Für optimale CRM-Integration empfehlen wir vollständige Adressdaten.',
      });
    }
    
    // Mock: Export erstellen
    const mockZipLink = `https://pix.immo/exports/crm-export-${Date.now()}.zip`;
    setExportLink(mockZipLink);
    toast.success('CRM-Export erstellt – ZIP bereit');
  };

  const getStatusBadge = (status: GalleryImageStatus) => {
    const variants: Record<GalleryImageStatus, { variant: any; label: string; icon: any }> = {
      'neu': { variant: 'secondary', label: 'Neu', icon: AlertCircle },
      'zur-pruefung': { variant: 'outline', label: 'Zur Prüfung', icon: Clock },
      'korrektur': { variant: 'destructive', label: 'Korrektur', icon: Edit3 },
      'freigegeben': { variant: 'default', label: 'Freigegeben', icon: CheckCircle2 },
      'v2+': { variant: 'secondary', label: 'v2+', icon: Sparkles },
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="text-xs flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`Galerie: ${pageTitle}`}
        description="Verwalten Sie Ihre Immobilienfotos - Freigabe, Änderungen, Downloads"
        path="/galerie"
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-2xl cursor-pointer">PIX.IMMO</span>
            </Link>
            <div className="flex items-center gap-4">
              {/* Demo Toggle für Paid User */}
              <div className="flex items-center gap-2 text-sm">
                <Label htmlFor="paid-toggle" className="text-xs">ALT-Text Paid:</Label>
                <Switch
                  id="paid-toggle"
                  checked={isPaidUser}
                  onCheckedChange={setIsPaidUser}
                />
              </div>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Batch Action Bar */}
      {selectedImages.size > 0 && (
        <div className="sticky top-[73px] z-30 bg-muted/80 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  {selectedImages.size} Bild{selectedImages.size !== 1 ? 'er' : ''} ausgewählt
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="w-4 h-4 mr-1" />
                  Auswahl aufheben
                </Button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => setApprovalDialogOpen(true)}
                  className="bg-[#2E2E2E] text-white hover:opacity-90"
                  style={{ borderRadius: '0px', height: '32px' }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Freigeben
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(Array.from(selectedImages))}
                  style={{ borderRadius: '0px', height: '32px' }}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportAltTexts(Array.from(selectedImages))}
                  style={{ borderRadius: '0px', height: '32px' }}
                >
                  <FileText className="w-4 h-4 mr-1" />
                  ALT-Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareLinkDialogOpen(true)}
                  style={{ borderRadius: '0px', height: '32px' }}
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Share-Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl">{pageTitle}</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  {jobInfo.useAddress ? `Job-Nr: ${jobInfo.jobNumber}` : `Adresse: ${jobInfo.address}`}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => setCostOverviewOpen(true)}
                  style={{ borderRadius: '0px', height: '32px' }}
                  className="text-xs sm:text-sm"
                >
                  <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Kostenübersicht</span>
                  <span className="sm:hidden">Kosten</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCrmExportOpen(true)}
                  style={{ borderRadius: '0px', height: '32px' }}
                  className="text-xs sm:text-sm"
                >
                  <FileText className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">CRM-Export</span>
                  <span className="sm:hidden">CRM</span>
                </Button>
                <Button
                  onClick={() => handleDownload(images.map(img => img.id))}
                  className="bg-[#2E2E2E] text-white hover:opacity-90 text-xs sm:text-sm"
                  style={{ borderRadius: '0px', height: '32px' }}
                >
                  <Download className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Alle herunterladen</span>
                  <span className="sm:hidden">Alle</span>
                </Button>
              </div>
            </div>
            
            {/* Package Limit Display */}
            <div className="mb-6 p-4 border border-border bg-muted/30" style={{ borderRadius: '0px' }}>
              <div className="flex items-start md:items-center justify-between mb-3 gap-2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <span className="text-sm">
                    {Math.min(totalImages, packageLimit)} / {packageLimit} Bilder im Paket enthalten
                  </span>
                  {extraImages > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="hidden md:inline text-muted-foreground">|</span>
                      <Badge variant="secondary" className="text-xs w-fit">
                        +{extraImages} Zusatzbild{extraImages !== 1 ? 'er' : ''}
                      </Badge>
                    </div>
                  )}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Zusatzbilder werden automatisch mit {extraImagePrice} € pro Bild berechnet</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-2 bg-muted overflow-hidden" style={{ borderRadius: '0px' }}>
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-300 ${
                    packageProgress > 100 ? 'bg-yellow-500' : 'bg-[#2E2E2E]'
                  }`}
                  style={{ width: `${Math.min(packageProgress, 100)}%` }}
                />
              </div>
              
              {totalImages >= packageLimit && (
                <p className="text-xs text-muted-foreground mt-2">
                  {totalImages === packageLimit 
                    ? 'Kontingent erreicht. Weitere Bilder werden als Zusatzbilder berechnet.'
                    : 'Sie haben Ihr Paket vollständig genutzt. Zusätzliche Bilder sind jederzeit möglich.'}
                </p>
              )}
            </div>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Dateiname, Raum oder Schlagwort..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  style={{ borderRadius: '0px' }}
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[180px]" style={{ borderRadius: '0px' }}>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Stati</SelectItem>
                  <SelectItem value="neu">Neu</SelectItem>
                  <SelectItem value="zur-pruefung">Zur Prüfung</SelectItem>
                  <SelectItem value="korrektur">Korrektur</SelectItem>
                  <SelectItem value="freigegeben">Freigegeben</SelectItem>
                  <SelectItem value="v2+">v2+</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[160px]" style={{ borderRadius: '0px' }}>
                  <SelectValue placeholder="Sortierung" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Datum</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                style={{ borderRadius: '0px', height: '40px' }}
              >
                Alle auswählen
              </Button>
            </div>
          </div>

          {/* Image Grid */}
          {filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Keine Bilder gefunden</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-2 space-y-2">
              {filteredImages.map((image, index) => (
                <div key={image.id} className="break-inside-avoid mb-2">
                  <GalleryImageCard
                    image={image}
                    imageIndex={index}
                    packageLimit={packageLimit}
                    selected={selectedImages.has(image.id)}
                    onToggleSelect={() => toggleSelection(image.id)}
                    onApprove={() => handleApprove([image.id])}
                    onRequestChange={() => handleRequestChange(image)}
                    onDownload={() => handleDownload([image.id])}
                    onKiEdit={() => handleKiEdit(image)}
                    onVersionCompare={() => {
                      setCurrentCompareImage(image);
                      setVersionCompareOpen(true);
                    }}
                    onImageClick={() => openLightbox(image)}
                    isPaidUser={isPaidUser}
                    onCopyAltText={(text) => copyToClipboard(text)}
                    isFavorite={favorites.includes(image.id)}
                    onToggleFavorite={() => handleToggleFavorite(image.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Annotation Overlay */}
      <AnnotationOverlay
        isOpen={annotationOpen}
        onClose={() => setAnnotationOpen(false)}
        onSave={handleAnnotationSave}
        image={currentAnnotationImage?.url || ''}
        filename={currentAnnotationImage?.filename || ''}
      />

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent style={{ borderRadius: '0px' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Bilder freigeben</DialogTitle>
            <DialogDescription>
              Bestätigen Sie die Freigabe der ausgewählten Bilder.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm mb-4">
              Möchten Sie {selectedImages.size} Bild{selectedImages.size !== 1 ? 'er' : ''} freigeben?
            </p>
            <p className="text-xs text-muted-foreground">
              Freigegebene Bilder werden für die finale Bearbeitung und Lieferung vorbereitet.
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
              style={{ borderRadius: '0px' }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={() => handleApprove(Array.from(selectedImages))}
              className="bg-[#2E2E2E] text-white hover:opacity-90"
              style={{ borderRadius: '0px' }}
            >
              Freigeben
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Link Dialog */}
      <Dialog open={shareLinkDialogOpen} onOpenChange={setShareLinkDialogOpen}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: '0px' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Externen Share-Link erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen teilbaren Link für externe Betrachter.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm mb-2 block">Link-Typ</Label>
              <RadioGroup value={shareLinkType} onValueChange={(v: any) => setShareLinkType(v)}>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="view" id="view" />
                  <Label htmlFor="view" className="text-sm cursor-pointer">Nur Ansicht</Label>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value="view-download" id="view-download" />
                  <Label htmlFor="view-download" className="text-sm cursor-pointer">Ansicht + Download</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="view-select" id="view-select" />
                  <Label htmlFor="view-select" className="text-sm cursor-pointer">Ansicht + Auswahl</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="expiry" className="text-sm mb-2 block">Ablaufdatum</Label>
              <Select value={shareLinkExpiry} onValueChange={setShareLinkExpiry}>
                <SelectTrigger id="expiry" style={{ borderRadius: '0px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Tage</SelectItem>
                  <SelectItem value="14">14 Tage</SelectItem>
                  <SelectItem value="30">30 Tage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="pin" className="text-sm mb-2 block">PIN (optional)</Label>
              <Input
                id="pin"
                type="text"
                placeholder="4-stellige PIN"
                value={shareLinkPin}
                onChange={(e) => setShareLinkPin(e.target.value.slice(0, 4))}
                maxLength={4}
                style={{ borderRadius: '0px' }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="watermark"
                checked={shareLinkWatermark}
                onCheckedChange={setShareLinkWatermark}
              />
              <Label htmlFor="watermark" className="text-sm cursor-pointer">Mit Wasserzeichen</Label>
            </div>
            
            {generatedShareLink && (
              <div className="p-3 bg-muted" style={{ borderRadius: '0px' }}>
                <p className="text-xs mb-2 text-muted-foreground">Generierter Link:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedShareLink}
                    readOnly
                    className="text-xs"
                    style={{ borderRadius: '0px' }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generatedShareLink)}
                    style={{ borderRadius: '0px' }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShareLinkDialogOpen(false);
                setGeneratedShareLink('');
              }}
              style={{ borderRadius: '0px' }}
            >
              Schließen
            </Button>
            <Button
              onClick={handleGenerateShareLink}
              className="bg-[#2E2E2E] text-white hover:opacity-90"
              style={{ borderRadius: '0px' }}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              Link generieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* KI Editor Dialog - Fullscreen */}
      <Dialog open={kiEditorOpen} onOpenChange={(open) => {
        setKiEditorOpen(open);
        if (!open) setKiZoom(100);
      }}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 flex flex-col" style={{ borderRadius: '0px' }}>
          <DialogHeader className="px-6 py-4 border-b border-border">
            <DialogTitle className="text-2xl">KI-Bildbearbeitung (Clipdrop)</DialogTitle>
            <DialogDescription>
              Bearbeiten Sie Ihr Bild mit KI-gestützten Werkzeugen.
            </DialogDescription>
          </DialogHeader>
          
          {currentKiImage && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Toolbar */}
              <div className="px-6 py-3 border-b border-border flex items-center gap-4 flex-wrap">
                <Button variant="outline" size="sm" style={{ borderRadius: '0px' }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Objekte entfernen
                </Button>
                <Button variant="outline" size="sm" style={{ borderRadius: '0px' }}>
                  <Undo2 className="w-4 h-4 mr-2" />
                  Rückgängig
                </Button>
                <Button variant="outline" size="sm" style={{ borderRadius: '0px' }}>
                  <Redo2 className="w-4 h-4 mr-2" />
                  Wiederholen
                </Button>
                
                <div className="h-6 w-px bg-border" />
                
                {/* Zoom Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKiZoom(Math.max(25, kiZoom - 25))}
                    disabled={kiZoom <= 25}
                    style={{ borderRadius: '0px' }}
                  >
                    -
                  </Button>
                  <span className="text-sm min-w-[60px] text-center">{kiZoom}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKiZoom(Math.min(200, kiZoom + 25))}
                    disabled={kiZoom >= 200}
                    style={{ borderRadius: '0px' }}
                  >
                    +
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setKiZoom(100)}
                    style={{ borderRadius: '0px' }}
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="flex-1" />
                
                <span className="text-xs text-muted-foreground">
                  Token: 45 / 100 verbraucht
                </span>
              </div>
              
              {/* Image Viewport */}
              <div className="flex-1 overflow-auto bg-muted/30 p-6">
                <div className="min-h-full flex items-center justify-center">
                  <img
                    src={currentKiImage.url}
                    alt={currentKiImage.filename}
                    className="max-w-none transition-transform duration-200"
                    style={{ 
                      transform: `scale(${kiZoom / 100})`,
                      transformOrigin: 'center center'
                    }}
                  />
                </div>
              </div>
              
              {/* Info Bar */}
              <div className="px-6 py-3 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  💡 Markieren Sie Objekte, die entfernt werden sollen. Die KI erstellt automatisch eine neue Version.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="px-6 py-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setKiEditorOpen(false)}
              style={{ borderRadius: '0px' }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleKiSave}
              className="bg-[#2E2E2E] text-white hover:opacity-90"
              style={{ borderRadius: '0px' }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Speichern als v{(currentKiImage?.version || 1) + 1}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cost Overview Dialog */}
      <Dialog open={costOverviewOpen} onOpenChange={setCostOverviewOpen}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: '0px' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Kostenübersicht</DialogTitle>
            <DialogDescription>
              Detaillierte Aufschlüsselung Ihrer Paket- und Zusatzkosten.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Enthaltene Bilder:</span>
                <span>{Math.min(totalImages, packageLimit)} × inkl.</span>
              </div>
              
              {extraImages > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span>Zusatzbilder:</span>
                  <span>{extraImages} × {extraImagePrice} €</span>
                </div>
              )}
              
              <div className="h-px bg-border" />
              
              <div className="flex items-center justify-between">
                <span>Zwischensumme:</span>
                <span>{extraImageCost.toFixed(2)} €</span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>zzgl. MwSt. (19%):</span>
                <span>{(extraImageCost * 0.19).toFixed(2)} €</span>
              </div>
              
              <div className="h-px bg-border" />
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Gesamt (brutto):</span>
                <span className="font-medium">{(extraImageCost * 1.19).toFixed(2)} €</span>
              </div>
            </div>
            
            {extraImages > 0 && (
              <div className="p-3 bg-muted/50 text-xs" style={{ borderRadius: '0px' }}>
                <p className="text-muted-foreground">
                  Die Kosten für Zusatzbilder werden automatisch zu Ihrer Rechnung hinzugefügt.
                  Sie erhalten eine separate Aufstellung per E-Mail.
                </p>
              </div>
            )}
            
            {extraImages === 0 && (
              <div className="p-3 bg-muted/50 text-xs text-center" style={{ borderRadius: '0px' }}>
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-muted-foreground">
                  Sie befinden sich innerhalb Ihres Paket-Kontingents.
                  Keine zusätzlichen Kosten.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCostOverviewOpen(false)}
              style={{ borderRadius: '0px' }}
            >
              Schließen
            </Button>
            {extraImages > 0 && (
              <Button
                onClick={() => {
                  toast.success('Zusatzbilder bestätigt');
                  setCostOverviewOpen(false);
                }}
                className="bg-[#2E2E2E] text-white hover:opacity-90"
                style={{ borderRadius: '0px' }}
              >
                Zusatzbilder bestätigen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CRM Export Dialog */}
      <Dialog open={crmExportOpen} onOpenChange={(open) => {
        setCrmExportOpen(open);
        if (!open) setExportLink('');
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ borderRadius: '0px' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl">CRM-Export</DialogTitle>
            <DialogDescription>
              Exportieren Sie Ihre Galerie-Daten für Ihr CRM-System.
            </DialogDescription>
          </DialogHeader>
          
          {!exportLink ? (
            <div className="space-y-6 py-4 overflow-y-auto">
              {/* CRM System Selection */}
              <div>
                <Label htmlFor="crm-system" className="text-sm mb-2 block">CRM-System</Label>
                <Select value={crmSystem} onValueChange={(v: any) => setCrmSystem(v)}>
                  <SelectTrigger id="crm-system" style={{ borderRadius: '0px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fio">FIO</SelectItem>
                    <SelectItem value="onoffice">onOffice</SelectItem>
                    <SelectItem value="propstack">Propstack</SelectItem>
                    <SelectItem value="csv">CSV/JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Object Title */}
              <div>
                <Label htmlFor="object-title" className="text-sm mb-2 block">Objektbezeichnung</Label>
                <Input
                  id="object-title"
                  value={objectTitle}
                  onChange={(e) => setObjectTitle(e.target.value)}
                  placeholder="z.B. Musterstraße 123, 22767 Hamburg"
                  style={{ borderRadius: '0px' }}
                />
              </div>
              
              {/* Street as Title Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="street-title"
                  checked={useStreetAsTitle}
                  onCheckedChange={(checked) => setUseStreetAsTitle(checked as boolean)}
                />
                <Label htmlFor="street-title" className="text-sm cursor-pointer">
                  Straßenname als Objekt-Titel verwenden
                </Label>
              </div>
              
              {/* Summary */}
              <div className="p-4 bg-muted/30 space-y-2" style={{ borderRadius: '0px' }}>
                <h3 className="text-sm font-medium">Zusammenfassung</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bilder gesamt:</span>
                    <span className="ml-2">{images.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hauptbild:</span>
                    <span className="ml-2">{images[0]?.filename || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CRM-System:</span>
                    <span className="ml-2">{crmSystem.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2">ZIP + CSV</span>
                  </div>
                </div>
              </div>
              
              {/* CSV Preview Table */}
              <div>
                <h3 className="text-sm font-medium mb-3">Vorschau: crm_import.csv</h3>
                <div className="border border-border overflow-x-auto" style={{ borderRadius: '0px' }}>
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '150px' }}>filename</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '100px' }}>object_id</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '200px' }}>object_title</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '80px' }}>is_primary</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '80px' }}>sequence</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '120px' }}>room_type</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '100px' }}>category</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '250px' }}>alt_text</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '150px' }}>tags</th>
                        <th className="px-3 py-2 text-left font-medium border-r border-border whitespace-nowrap" style={{ minWidth: '80px' }}>version</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap" style={{ minWidth: '200px' }}>notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {images.slice(0, 5).map((img, index) => (
                        <tr key={img.id} className="border-t border-border hover:bg-muted/30">
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">{img.filename}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">OBJ-{Date.now().toString().slice(-6)}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">{objectTitle}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap text-center">{index === 0 ? '1' : '0'}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap text-center">{index + 1}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">{img.roomType || '-'}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">interior</td>
                          <td className="px-3 py-2 border-r border-border" style={{ maxWidth: '250px' }}>
                            <div className="truncate">{img.altText || '-'}</div>
                          </td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap">{img.tags?.join(', ') || '-'}</td>
                          <td className="px-3 py-2 border-r border-border whitespace-nowrap text-center">{img.version}</td>
                          <td className="px-3 py-2 whitespace-nowrap">-</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Zeigt die ersten 5 von {images.length} Bildern. Alle Bilder werden im Export enthalten sein.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-6 bg-muted/30 text-center space-y-4" style={{ borderRadius: '0px' }}>
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
                <div>
                  <h3 className="text-sm font-medium mb-2">Export erfolgreich erstellt</h3>
                  <p className="text-xs text-muted-foreground">
                    Ihr CRM-Export ist bereit zum Download
                  </p>
                </div>
                
                <div className="p-3 bg-background border border-border" style={{ borderRadius: '0px' }}>
                  <p className="text-xs mb-2 text-muted-foreground">Download-Link:</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={exportLink}
                      readOnly
                      className="text-xs"
                      style={{ borderRadius: '0px' }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(exportLink)}
                      style={{ borderRadius: '0px' }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button
                  className="bg-[#2E2E2E] text-white hover:opacity-90"
                  style={{ borderRadius: '0px' }}
                  onClick={() => window.open(exportLink, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ZIP herunterladen
                </Button>
              </div>
              
              <div className="p-3 bg-muted/50 text-xs space-y-2" style={{ borderRadius: '0px' }}>
                <h4 className="font-medium">Inhalt des ZIP-Archivs:</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>crm_import.csv – Metadaten aller Bilder</li>
                  <li>images/ – Ordner mit allen Bilddateien</li>
                  <li>README.txt – Importanleitung für {crmSystem.toUpperCase()}</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCrmExportOpen(false)}
              style={{ borderRadius: '0px' }}
            >
              {exportLink ? 'Schließen' : 'Abbrechen'}
            </Button>
            {!exportLink && (
              <Button
                onClick={handleCrmExport}
                className="bg-[#2E2E2E] text-white hover:opacity-90"
                style={{ borderRadius: '0px' }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export erstellen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                {lightboxImage?.mediaType === 'video' && (
                  <Film className="w-5 h-5 text-muted-foreground" />
                )}
                <h2 className="text-2xl">{lightboxImage?.filename}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                {lightboxImage?.resolution} • {lightboxImage?.uploadDate} • {lightboxImage?.mediaType === 'video' ? 'Video' : 'Bild'} {lightboxIndex + 1} von {filteredImages.length}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLightboxOpen(false)}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {lightboxImage && (
            <>
              {/* Image/Video Viewport */}
              <div className="flex-1 overflow-auto bg-black flex items-center justify-center p-4 min-h-0 relative">
                {lightboxImage.mediaType === 'video' ? (
                  <video
                    src={lightboxImage.url}
                    controls
                    autoPlay
                    loop
                    className="max-w-full max-h-full"
                    style={{ width: 'auto', height: 'auto' }}
                  >
                    Ihr Browser unterstützt keine Videos.
                  </video>
                ) : (
                  <img
                    src={lightboxImage.url}
                    alt={lightboxImage.filename}
                    className="max-w-full max-h-full object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                )}
                
                {/* Navigation Arrows */}
                {lightboxIndex > 0 && (
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 transition-all shadow-lg z-10"
                    aria-label="Vorheriges Bild"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                )}
                
                {lightboxIndex < filteredImages.length - 1 && (
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 transition-all shadow-lg z-10"
                    aria-label="Nächstes Bild"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                )}
              </div>
              
              {/* Info Bar */}
              {lightboxImage.altText && (
                <div className="px-6 py-3 border-t border-border bg-background shrink-0">
                  <p className="text-xs">
                    <span className="text-muted-foreground">ALT-Text: </span>
                    {lightboxImage.altText}
                  </p>
                </div>
              )}

              {/* Comments Section */}
              <div className="px-6 py-4 border-t border-border bg-background shrink-0 max-h-64 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Kommentare ({comments.length})</h3>
                  </div>

                  {/* Existing Comments */}
                  {comments.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="border-l-2 border-border pl-3 py-1">
                          <p className="text-sm">{comment.comment}</p>
                          {comment.altText && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Alt-Text: {comment.altText}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(comment.createdAt).toLocaleString('de-DE')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Comment Form */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Kommentar hinzufügen..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="resize-none text-sm"
                      rows={2}
                      data-testid="input-comment"
                    />
                    <Input
                      placeholder="Alt-Text (optional)"
                      value={newAltText}
                      onChange={(e) => setNewAltText(e.target.value)}
                      className="text-sm"
                      data-testid="input-alttext"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={addCommentMutation.isPending || !newComment.trim()}
                      className="w-full"
                      data-testid="button-add-comment"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {addCommentMutation.isPending ? 'Wird gesendet...' : 'Kommentar hinzufügen'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-border bg-background shrink-0 flex justify-between gap-2">
                <Button
                  variant="outline"
                  style={{ borderRadius: '0px' }}
                  onClick={() => handleKiEdit(lightboxImage)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  KI-Bearbeitung
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setLightboxOpen(false)}
                    style={{ borderRadius: '0px' }}
                  >
                    Schließen
                  </Button>
                  <Button
                    onClick={() => handleDownload([lightboxImage.id])}
                    className="bg-[#2E2E2E] text-white hover:opacity-90"
                    style={{ borderRadius: '0px' }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Version Compare Dialog */}
      <Dialog open={versionCompareOpen} onOpenChange={setVersionCompareOpen}>
        <DialogContent className="sm:max-w-4xl" style={{ borderRadius: '0px' }}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Versionsvergleich</DialogTitle>
            <DialogDescription>
              Vergleichen Sie verschiedene Versionen Ihres Bildes.
            </DialogDescription>
          </DialogHeader>
          
          {currentCompareImage && currentCompareImage.versions && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                {currentCompareImage.versions.slice(-2).map((v) => (
                  <div key={v.version} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Version {v.version}</Badge>
                      {v.aiEdited && (
                        <Badge variant="secondary" className="text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          KI-bearbeitet
                        </Badge>
                      )}
                    </div>
                    <img
                      src={v.url}
                      alt={`Version ${v.version}`}
                      className="w-full h-auto border border-border"
                      style={{ borderRadius: '0px' }}
                    />
                    <p className="text-xs text-muted-foreground">{v.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVersionCompareOpen(false)}
              style={{ borderRadius: '0px' }}
            >
              Schließen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

// Gallery Image Card Component
function GalleryImageCard({
  image,
  imageIndex,
  packageLimit,
  selected,
  onToggleSelect,
  onApprove,
  onRequestChange,
  onDownload,
  onKiEdit,
  onVersionCompare,
  onImageClick,
  isPaidUser,
  onCopyAltText,
  isFavorite,
  onToggleFavorite,
}: {
  image: GalleryImage;
  imageIndex: number;
  packageLimit: number;
  selected: boolean;
  onToggleSelect: () => void;
  onApprove: () => void;
  onRequestChange: () => void;
  onDownload: () => void;
  onKiEdit: () => void;
  onVersionCompare: () => void;
  onImageClick: () => void;
  isPaidUser: boolean;
  onCopyAltText: (text: string) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [altTextExpanded, setAltTextExpanded] = useState(false);
  const isExtraImage = imageIndex >= packageLimit;

  return (
    <div
      className="bg-white border border-border overflow-hidden"
      style={{ borderRadius: '0px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image/Video Container - Native Aspekt-Verhältnisse für Masonry */}
      <div className={`relative ${getAspectRatioClass(image.aspectRatio)} overflow-hidden bg-muted cursor-pointer group`} onClick={onImageClick}>
        {image.mediaType === 'video' ? (
          <>
            <img
              src={image.thumbnail}
              alt={image.filename}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isHovered ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Play Icon Overlay for Videos */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 rounded-full p-4">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={image.thumbnail}
            alt={image.filename}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        )}
        
        {/* Zoom/Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          {image.mediaType === 'video' ? (
            <Film className="w-12 h-12 text-white" />
          ) : (
            <ZoomIn className="w-12 h-12 text-white" />
          )}
        </div>
        
        {/* Checkbox & Favorite Heart */}
        <div className="absolute top-2 left-2 z-10 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            onCheckedChange={onToggleSelect}
            className="bg-white border-2"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 bg-white/90 backdrop-blur-sm hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            data-testid={`button-favorite-${image.id}`}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
            />
          </Button>
        </div>
        
        {/* Status Badge & Extra Image Badge */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {getStatusBadge(image.status)}
          {isExtraImage && (
            <Badge variant="outline" className="text-xs bg-white/90 backdrop-blur-sm">
              Zusatzbild
            </Badge>
          )}
        </div>
        
        {/* Version Badge */}
        {image.version > 1 && (
          <div className="absolute bottom-2 left-2 z-10">
            <Badge
              variant="secondary"
              className="text-xs cursor-pointer"
              onClick={onVersionCompare}
            >
              v{image.version}
              {image.versions && image.versions.length > 1 && (
                <ChevronDown className="w-3 h-3 ml-1" />
              )}
            </Badge>
          </div>
        )}
        
        {/* ALT-Text Overlay (Unpaid) - Dezent am unteren Rand */}
        {!isPaidUser && image.altText && !selected && (
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8"
            style={{ userSelect: 'none' }}
          >
            <p className="text-white text-xs opacity-90 line-clamp-2">{image.altText}</p>
          </div>
        )}
      </div>
      
      {/* Metadata */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              {image.mediaType === 'video' && (
                <Film className="w-3 h-3 text-muted-foreground" />
              )}
              <p className="text-sm truncate">{image.filename}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {image.resolution} • {image.uploadDate}
            </p>
            {image.roomType && (
              <p className="text-xs text-muted-foreground">{image.roomType}</p>
            )}
          </div>
        </div>
        
        {/* ALT-Text Panel (Paid) */}
        {isPaidUser && image.altText && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">ALT-Text:</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => onCopyAltText(image.altText!)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setAltTextExpanded(!altTextExpanded)}
                >
                  <ChevronDown className={`w-3 h-3 transition-transform ${altTextExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
            <p className={`text-xs ${altTextExpanded ? '' : 'line-clamp-2'}`}>
              {image.altText}
            </p>
          </div>
        )}
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onApprove}
            disabled={image.status === 'freigegeben'}
            className="text-xs h-7"
            style={{ borderRadius: '0px' }}
          >
            <Check className="w-3 h-3 mr-1" />
            Freigeben
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRequestChange}
            className="text-xs h-7"
            style={{ borderRadius: '0px' }}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Ändern
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="text-xs h-7"
            style={{ borderRadius: '0px' }}
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onKiEdit}
            className="text-xs h-7"
            style={{ borderRadius: '0px' }}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            KI
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: GalleryImageStatus) {
  const variants: Record<GalleryImageStatus, { variant: any; label: string; icon: any }> = {
    'neu': { variant: 'secondary', label: 'Neu', icon: AlertCircle },
    'zur-pruefung': { variant: 'outline', label: 'Zur Prüfung', icon: Clock },
    'korrektur': { variant: 'destructive', label: 'Korrektur', icon: Edit3 },
    'freigegeben': { variant: 'default', label: 'Freigegeben', icon: CheckCircle2 },
    'v2+': { variant: 'secondary', label: 'v2+', icon: Sparkles },
  };
  
  const config = variants[status];
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="text-xs flex items-center gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
