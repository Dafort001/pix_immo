import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEOHead } from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import { homePageImages, pixCaptureImages, type ImageAsset } from '@/data/images';

export default function AdminMediaLibrary() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [editingImage, setEditingImage] = useState<ImageAsset | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const allImages: ImageAsset[] = [...homePageImages, ...pixCaptureImages];
  
  const filteredImages = selectedPage === 'all' 
    ? allImages 
    : allImages.filter(img => img.page === selectedPage);

  const stats = {
    total: allImages.length,
    home: homePageImages.length,
    pixcapture: pixCaptureImages.length,
    gallery: 0,
    blog: 0,
  };

  const handleEditImage = (image: ImageAsset) => {
    setEditingImage(image);
    setShowDialog(true);
  };

  const handleSaveImage = () => {
    toast({
      title: "Bild aktualisiert",
      description: "Die Änderungen wurden gespeichert",
    });
    setShowDialog(false);
    setEditingImage(null);
  };

  const getPageBadge = (page: string) => {
    const colors: Record<string, string> = {
      home: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      pixcapture: 'bg-green-500/10 text-green-600 border-green-500/20',
      gallery: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      blog: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    };

    return (
      <Badge variant="outline" className={colors[page] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}>
        {page}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="Media Library – pix.immo Admin" description="Bilder-Verwaltung" path="/admin/media-library" />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                <p className="text-gray-600">Verwalte Bilder auf öffentlichen Seiten</p>
              </div>
            </div>

            <Button data-testid="button-add-image">
              <Plus className="h-5 w-5 mr-2" />
              Bild hochladen
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 text-sm">{stats.total} Bilder gesamt</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Home: {stats.home}</Badge>
              <Badge variant="outline">PixCapture: {stats.pixcapture}</Badge>
              <Badge variant="outline">Gallery: {stats.gallery}</Badge>
              <Badge variant="outline">Blog: {stats.blog}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-[104px] z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
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

            <span className="text-gray-600 text-sm">
              {filteredImages.length} von {allImages.length} Bildern
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.id} className="group relative overflow-hidden" data-testid={`image-card-${image.id}`}>
              <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
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
                <p className="font-medium text-sm text-gray-900 mb-1 truncate" title={image.alt}>
                  {image.alt}
                </p>
                <p className="text-xs text-gray-500 truncate" title={image.description}>
                  {image.description || 'Keine Beschreibung'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{image.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Keine Bilder gefunden</p>
          </div>
        )}
      </main>

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
    </div>
  );
}
