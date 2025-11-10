import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Plus, Edit2, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@shared/components';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { PublicImage } from '@shared/schema';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminPageHeader } from '@/components/AdminPageHeader';

export default function AdminMediaLibrary() {
  const { user, isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [editingImage, setEditingImage] = useState<PublicImage | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPage, setUploadPage] = useState<string>('home');
  
  const { data: images = [], isLoading } = useQuery<PublicImage[]>({
    queryKey: ['/api/media-library'],
  });
  
  const filteredImages = selectedPage === 'all' 
    ? images 
    : images.filter(img => img.page === selectedPage);

  const stats = {
    total: images.length,
    home: images.filter(img => img.page === 'home').length,
    pixcapture: images.filter(img => img.page === 'pixcapture').length,
    gallery: images.filter(img => img.page === 'gallery').length,
    blog: images.filter(img => img.page === 'blog').length,
  };

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; alt: string; description?: string; url: string }) => {
      return await apiRequest('PATCH', '/api/media-library/' + data.id, {
        alt: data.alt,
        description: data.description,
        url: data.url,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media-library'] });
      toast({ title: "Bild aktualisiert" });
      setShowDialog(false);
      setEditingImage(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Fehler", 
        description: error.message || "Bild konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('page', uploadPage);

      const response = await fetch('/api/media-library/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload fehlgeschlagen');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/media-library'] });
      toast({ title: "Bilder erfolgreich hochgeladen" });
      setShowUploadDialog(false);
      setUploadFiles([]);
      setUploadPage('home');
    },
    onError: (error: any) => {
      toast({ 
        title: "Fehler beim Upload", 
        description: error.message || "Bilder konnten nicht hochgeladen werden",
        variant: "destructive"
      });
    },
  });

  if (authLoading) return null;

  const handleEditImage = (image: PublicImage) => {
    setEditingImage(image);
    setShowDialog(true);
  };

  const handleSaveImage = () => {
    if (!editingImage) return;
    updateMutation.mutate({
      id: editingImage.id,
      alt: editingImage.alt,
      description: editingImage.description || undefined,
      url: editingImage.url,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
  };

  const handleUpload = () => {
    if (uploadFiles.length === 0) {
      toast({ 
        title: "Keine Dateien ausgewählt", 
        description: "Bitte wähle mindestens ein Bild aus",
        variant: "destructive" 
      });
      return;
    }
    uploadMutation.mutate(uploadFiles);
  };

  const getPageBadge = (page: string) => {
    return (
      <Badge variant="outline">
        {page}
      </Badge>
    );
  };

  if (!user) return null;

  return (
    <AdminLayout userRole={user.role}>
      <SEOHead title="Media Library – pix.immo Admin" description="Bilder-Verwaltung" path="/admin/media-library" />
      
      <div className="flex flex-col h-full">
        <AdminPageHeader
          title="Media Library"
          actions={
            <Button onClick={() => setShowUploadDialog(true)} data-testid="button-add-image">
              <Plus className="h-4 w-4 mr-2" />
              Bild hochladen
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stats.total} Bilder gesamt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Home: {stats.home}</Badge>
                  <Badge variant="outline">PixCapture: {stats.pixcapture}</Badge>
                  <Badge variant="outline">Gallery: {stats.gallery}</Badge>
                  <Badge variant="outline">Blog: {stats.blog}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Select value={selectedPage} onValueChange={setSelectedPage}>
                  <SelectTrigger className="w-[200px]" data-testid="select-page-filter">
                    <SelectValue placeholder="Seite filtern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Seiten</SelectItem>
                    <SelectItem value="home">Homepage</SelectItem>
                    <SelectItem value="pixcapture">PixCapture</SelectItem>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">
                  {filteredImages.length} von {images.length} Bildern
                </span>
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="aspect-[4/3] w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Bilder gefunden</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="group relative overflow-hidden" data-testid={`image-card-${image.id}`}>
                    <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                      <img src={image.url} alt={image.alt} className="w-full h-full object-cover" />
                      
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => handleEditImage(image)}
                          data-testid={`button-edit-${image.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                          data-testid={`button-view-${image.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="absolute top-2 right-2">
                        {getPageBadge(image.page)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <p className="font-medium text-sm mb-1 truncate" title={image.alt}>
                        {image.alt}
                      </p>
                      <p className="text-xs text-muted-foreground truncate" title={image.description ?? undefined}>
                        {image.description || 'Keine Beschreibung'}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">{image.id}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDialog && editingImage && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Bild bearbeiten</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <img src={editingImage.url} alt={editingImage.alt} className="w-full rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">ID: {editingImage.id}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Seite</label>
                  <Select value={editingImage.page} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Homepage</SelectItem>
                      <SelectItem value="pixcapture">PixCapture</SelectItem>
                      <SelectItem value="gallery">Gallery</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Alt-Text (Accessibility)</label>
                  <Input
                    value={editingImage.alt}
                    onChange={(e) => setEditingImage({...editingImage, alt: e.target.value})}
                    placeholder="Beschreibe das Bild für Screenreader..."
                    data-testid="input-alt-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">SEO Beschreibung</label>
                  <Textarea
                    value={editingImage.description || ''}
                    onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                    placeholder="Optionale SEO-Beschreibung..."
                    className="min-h-[100px]"
                    data-testid="textarea-description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Bild-URL</label>
                  <Input
                    value={editingImage.url}
                    onChange={(e) => setEditingImage({...editingImage, url: e.target.value})}
                    placeholder="https://..."
                    data-testid="input-url"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                    Abbrechen
                  </Button>
                  <Button onClick={handleSaveImage} className="flex-1" data-testid="button-save-image">
                    Speichern
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showUploadDialog && (
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bilder hochladen</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Seite auswählen</label>
                <Select value={uploadPage} onValueChange={setUploadPage}>
                  <SelectTrigger data-testid="select-upload-page">
                    <SelectValue placeholder="Wähle eine Seite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Homepage</SelectItem>
                    <SelectItem value="pixcapture">PixCapture</SelectItem>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bilder auswählen
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
                {uploadFiles.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadFiles.length} Datei(en) ausgewählt
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Hinweis:</strong> Bilder werden automatisch in Object Storage gespeichert 
                  und können danach mit Alt-Text und SEO-Beschreibung versehen werden.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowUploadDialog(false);
                    setUploadFiles([]);
                  }} 
                  className="flex-1"
                  data-testid="button-cancel-upload"
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploadMutation.isPending || uploadFiles.length === 0}
                  className="flex-1"
                  data-testid="button-submit-upload"
                >
                  {uploadMutation.isPending ? 'Wird hochgeladen...' : 'Hochladen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
