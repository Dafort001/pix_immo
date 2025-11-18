import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/header';
import { Thumbnail } from './components/thumbnail';
import { ImagePreviewModal } from './components/image-preview-modal';
import { EditRequestModal } from './components/edit-request-modal';
import { AnnotationOverlay } from './components/annotation-overlay';
import { StyleGuide } from './components/style-guide';
import { GalleryStats } from './components/gallery-stats';
import { FilterBar, FilterType } from './components/filter-bar';
import { Pagination } from './components/pagination';
import { BulkActions } from './components/bulk-actions';
import { PackageSelector, PackageType } from './components/package-selector';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { toast, Toaster } from 'sonner@2.0.3';

// Basis-Bilder und Videos für die Galerie
const baseImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjMzNDczMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'wohnzimmer_001.jpg',
    alt: 'Modernes Wohnzimmer mit großem Fenster und hellen Möbeln',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1638885930125-85350348d266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MzQxMjMxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'wohnzimmer_002.jpg',
    alt: 'Luxuriöses Wohnzimmer mit Designer-Sofa und Kunstwerken',
    variant: 'selected' as const,
    mediaType: 'image' as const
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVufGVufDF8fHx8MTc2MzQ0ODE1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'kueche_001.jpg',
    alt: 'Moderne Küche mit Kochinsel und hochwertigen Geräten',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 4,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNjMzOTAzMTN8MA&ixlib=rb-4.1.0&q=80&w=400',
    filename: 'rundgang_wohnzimmer.mp4',
    alt: '360° Rundgang durch das moderne Wohnzimmer',
    variant: 'normal' as const,
    mediaType: 'video' as const,
    duration: 15
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYzMzkwMzEzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'schlafzimmer_001.jpg',
    alt: 'Gemütliches Schlafzimmer mit Doppelbett und warmer Beleuchtung',
    variant: 'locked' as const,
    mediaType: 'image' as const
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMGludGVyaW9yfGVufDF8fHx8MTc2MzM2Mzc0MXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'badezimmer_001.jpg',
    alt: 'Elegantes Badezimmer mit freistehender Badewanne',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 7,
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600494603989-9650cf6ddd3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwb2ZmaWNlfGVufDF8fHx8MTc2MzQ2ODQ0OHww&ixlib=rb-4.1.0&q=80&w=400',
    filename: 'immobilien_tour.mp4',
    alt: 'Vollständige Immobilientour durch alle Räume',
    variant: 'selected' as const,
    mediaType: 'video' as const,
    duration: 30
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1469022563428-aa04fef9f5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiYWxjb255fGVufDF8fHx8MTc2MzQ1Njg2NXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'balkon_001.jpg',
    alt: 'Balkon mit Außenmöbeln und Stadtblick',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1652369805767-3f1c28f25046?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBoYWxsd2F5fGVufDF8fHx8MTc2MzM4NDUyMXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'flur_001.jpg',
    alt: 'Heller Eingangsbereich mit modernem Flurdesign',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjMzNDczMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'wohnzimmer_003.jpg',
    alt: 'Weiterer Blickwinkel auf das moderne Wohnzimmer',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1638885930125-85350348d266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc2MzQxMjMxOXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'wohnzimmer_004.jpg',
    alt: 'Detailaufnahme der Wohnzimmereinrichtung',
    variant: 'selected' as const,
    mediaType: 'image' as const
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVufGVufDF8fHx8MTc2MzQ0ODE1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    filename: 'kueche_002.jpg',
    alt: 'Küchenzeile mit Blick auf den Essbereich',
    variant: 'normal' as const,
    mediaType: 'image' as const
  },
];

// Generiere 150 Medien-Items basierend auf den Basis-Items
const galleryImages = Array.from({ length: 150 }, (_, index) => {
  const baseImage = baseImages[index % baseImages.length];
  const imageNumber = Math.floor(index / baseImages.length) + 1;
  const roomType = baseImage.filename.split('_')[0].split('.')[0];
  const variants: Array<'normal' | 'locked' | 'editing' | 'selected'> = ['normal', 'normal', 'normal', 'normal', 'normal', 'normal', 'selected', 'locked', 'editing'];
  const variant = variants[index % variants.length];
  const fileExtension = baseImage.mediaType === 'video' ? 'mp4' : 'jpg';
  
  return {
    id: index + 1,
    url: baseImage.url,
    thumbnailUrl: baseImage.mediaType === 'video' ? baseImage.thumbnailUrl : undefined,
    filename: `${roomType}_${String(index + 1).padStart(3, '0')}.${fileExtension}`,
    alt: baseImage.alt,
    variant,
    mediaType: baseImage.mediaType,
    duration: baseImage.mediaType === 'video' ? baseImage.duration : undefined
  };
});

// Verfügbare Pakete
const AVAILABLE_PACKAGES: PackageType[] = [
  {
    id: 'small',
    name: 'Basis',
    imageCount: 10,
    price: 180.00,
    pricePerAdditionalImage: 6.00
  },
  {
    id: 'medium',
    name: 'Standard',
    imageCount: 20,
    price: 220.00,
    pricePerAdditionalImage: 6.00
  },
  {
    id: 'large',
    name: 'Premium',
    imageCount: 40,
    price: 300.00,
    pricePerAdditionalImage: 6.00
  }
];

export default function App() {
  // Paket-Auswahl (wird von Buchungsmaske übertragen, hier als Beispiel "Standard")
  const [selectedPackage] = useState<PackageType>(AVAILABLE_PACKAGES[1]); // Standard als Default, nicht änderbar

  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    image: string;
    filename: string;
    imageId: number;
  }>({
    isOpen: false,
    image: '',
    filename: '',
    imageId: -1
  });

  const [editRequestModal, setEditRequestModal] = useState(false);
  const [annotationOverlay, setAnnotationOverlay] = useState<{
    isOpen: boolean;
    image: string;
    filename: string;
  }>({
    isOpen: false,
    image: '',
    filename: ''
  });

  // Filter & Pagination state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [imageNotes, setImageNotes] = useState<Record<number, string>>({});
  const itemsPerPage = 24;

  // Berechne wie viele Bilder im Paket und wie viele zusätzlich sind
  const imagesInPackage = Math.min(selectedImages.size, selectedPackage.imageCount);
  const additionalImagesCount = Math.max(0, selectedImages.size - selectedPackage.imageCount);

  // Filter images based on active filter
  const filteredImages = useMemo(() => {
    if (activeFilter === 'all') return galleryImages;
    return galleryImages.filter(img => img.variant === activeFilter);
  }, [activeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const selected = galleryImages.filter(img => img.variant === 'selected').length;
    const locked = galleryImages.filter(img => img.variant === 'locked').length;
    const editing = galleryImages.filter(img => img.variant === 'editing').length;
    
    return {
      total: galleryImages.length,
      selected,
      locked,
      editing,
      normal: galleryImages.length - selected - locked - editing
    };
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredImages.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredImages, currentPage, itemsPerPage]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleThumbnailClick = (image: string, filename: string, imageId: number) => {
    setPreviewModal({
      isOpen: true,
      image,
      filename,
      imageId
    });
  };

  // Navigation im Preview Modal
  const handlePreviewNext = () => {
    const currentImageIndex = filteredImages.findIndex(img => img.id === previewModal.imageId);
    if (currentImageIndex < filteredImages.length - 1) {
      const nextImage = filteredImages[currentImageIndex + 1];
      setPreviewModal({
        isOpen: true,
        image: nextImage.url,
        filename: nextImage.filename,
        imageId: nextImage.id
      });
    }
  };

  const handlePreviewPrevious = () => {
    const currentImageIndex = filteredImages.findIndex(img => img.id === previewModal.imageId);
    if (currentImageIndex > 0) {
      const prevImage = filteredImages[currentImageIndex - 1];
      setPreviewModal({
        isOpen: true,
        image: prevImage.url,
        filename: prevImage.filename,
        imageId: prevImage.id
      });
    }
  };

  const handleToggleSelectionInPreview = () => {
    toggleImageSelection(previewModal.imageId);
  };

  const handleNoteChange = (imageId: number, note: string) => {
    setImageNotes(prev => ({
      ...prev,
      [imageId]: note
    }));
    
    if (note.trim()) {
      toast.success('Notiz gespeichert', {
        description: 'Ihre Notiz wurde gespeichert.',
        duration: 2000,
      });
    }
  };

  const handleRequestEdit = () => {
    setPreviewModal({ ...previewModal, isOpen: false });
    setEditRequestModal(true);
  };

  const handleStartAnnotation = () => {
    setEditRequestModal(false);
    setAnnotationOverlay({
      isOpen: true,
      image: previewModal.image,
      filename: previewModal.filename
    });
  };

  const handleDownloadZip = () => {
    console.log('ZIP-Download wird vorbereitet...');
  };

  const handleSubmitEdit = (editType: string, description: string) => {
    console.log('Bearbeitung angefordert:', { editType, description });
  };

  const handleSaveAnnotation = (annotationData: string) => {
    console.log('Annotation gespeichert');
  };

  // Bulk actions
  const toggleImageSelection = (imageId: number) => {
    const newSelection = new Set(selectedImages);
    
    if (newSelection.has(imageId)) {
      // Bild abwählen
      newSelection.delete(imageId);
      setSelectedImages(newSelection);
      
      const newAdditionalCount = Math.max(0, newSelection.size - selectedPackage.imageCount);
      
      // Feedback nur wenn man von zusätzlichen Bildern runter geht
      if (selectedImages.size > selectedPackage.imageCount && newAdditionalCount === 0) {
        toast.success('Sie sind wieder im Paketlimit!', {
          description: `${newSelection.size} von ${selectedPackage.imageCount} Bildern ausgewählt`,
          duration: 2500,
        });
      }
    } else {
      // Bild hinzufügen
      newSelection.add(imageId);
      const newAdditionalCount = Math.max(0, newSelection.size - selectedPackage.imageCount);
      
      // Warnung wenn das erste zusätzliche Bild ausgewählt wird
      if (newSelection.size === selectedPackage.imageCount + 1) {
        toast.warning('Paketlimit erreicht!', {
          description: `Weitere Bilder kosten € ${selectedPackage.pricePerAdditionalImage.toFixed(2)} pro Bild. Sie können Ihre Auswahl jederzeit ändern.`,
          duration: 4000,
        });
      } else if (newAdditionalCount > 0) {
        // Info bei weiteren zusätzlichen Bildern
        const additionalCost = newAdditionalCount * selectedPackage.pricePerAdditionalImage;
        toast.info('Zusatzbild hinzugefügt', {
          description: `${newAdditionalCount} zusätzliche Bilder (+ € ${additionalCost.toFixed(2)})`,
          duration: 2500,
        });
      }
      
      setSelectedImages(newSelection);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(galleryImages.map(img => img.id));
    const additionalCount = Math.max(0, allIds.size - selectedPackage.imageCount);
    
    setSelectedImages(allIds);
    
    if (additionalCount > 0) {
      const additionalCost = additionalCount * selectedPackage.pricePerAdditionalImage;
      toast.warning(`${allIds.size} Bilder ausgewählt`, {
        description: `${additionalCount} zusätzliche Bilder für € ${additionalCost.toFixed(2)}`,
        duration: 3000,
      });
    } else {
      toast.success('Alle Bilder ausgewählt', {
        duration: 2000,
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedImages(new Set());
    toast.info('Auswahl aufgehoben', {
      description: 'Alle Bilder wurden abgewählt.',
      duration: 2000,
    });
  };

  const handleDownloadSelected = () => {
    console.log('Download ausgewählter Bilder:', Array.from(selectedImages));
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-24">
      {/* Header */}
      <Header 
        jobTitle="Wohnung Winterhude – Shooting 2025-11-14"
        packageSize={`Paket: ${galleryImages.length} Bilder`}
        onDownloadZip={handleDownloadZip}
      />
      
      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Package Info (nicht änderbar, wird von Buchung übertragen) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-gray-900">Ihr gebuchtes Paket</h3>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-gray-600">
                  <span className="text-gray-900">{selectedPackage.name}</span> – {selectedPackage.imageCount} Bilder inklusive
                </div>
                <div className="text-sm text-gray-500">
                  Zusätzliche Bilder: € {selectedPackage.pricePerAdditionalImage.toFixed(2)} pro Bild
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Paketpreis</div>
              <div className="text-2xl text-gray-900">€ {selectedPackage.price.toFixed(2)}</div>
            </div>
          </div>

          {/* Auswahlstatus */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            {additionalImagesCount === 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">
                    {selectedImages.size} von {selectedPackage.imageCount} Bildern ausgewählt
                  </span>
                </div>
                <span className="text-sm text-green-600">Im Paket enthalten</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Im Paket ({selectedPackage.imageCount} Bilder)</span>
                  <span className="text-gray-900">€ {selectedPackage.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm bg-amber-50 -mx-6 px-6 py-2">
                  <span className="text-amber-900">
                    Zusätzlich ({additionalImagesCount} × € {selectedPackage.pricePerAdditionalImage.toFixed(2)})
                  </span>
                  <span className="text-amber-900">
                    + € {(additionalImagesCount * selectedPackage.pricePerAdditionalImage).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Gesamtpreis</span>
                  <span className="text-blue-600 text-xl">
                    € {(selectedPackage.price + additionalImagesCount * selectedPackage.pricePerAdditionalImage).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Hinweis */}
          {additionalImagesCount === 0 && selectedImages.size < selectedPackage.imageCount && (
            <div className="mt-4 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
              💡 Sie können noch {selectedPackage.imageCount - selectedImages.size} Bilder auswählen, ohne zusätzliche Kosten
            </div>
          )}
          
          {additionalImagesCount > 0 && (
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
              ⚠️ Sie können Ihre Auswahl jederzeit ändern. Wenn Sie {additionalImagesCount} Bild{additionalImagesCount > 1 ? 'er' : ''} abwählen, bleiben Sie im kostenlosen Paketlimit.
            </div>
          )}
        </div>

        {/* Gallery Stats */}
        <GalleryStats
          total={stats.total}
          selected={stats.selected}
          locked={stats.locked}
          editing={stats.editing}
        />

        {/* Filter Bar */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          counts={{
            all: galleryImages.length,
            normal: stats.normal,
            selected: stats.selected,
            locked: stats.locked,
            editing: stats.editing
          }}
        />

        {/* Galerie-Grid - Masonry Layout */}
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 640: 2, 1024: 3, 1280: 4 }}
        >
          <Masonry gutter="24px">
            {paginatedImages.map((image, index) => {
              const isCurrentSelected = selectedImages.has(image.id);
              
              // Bestimme ob dieses Bild als "im Paket" oder "zusätzlich" gilt
              // Wir müssen die ausgewählten Bilder nach ID sortieren und die ersten X als "im Paket" markieren
              const selectedArray = Array.from(selectedImages).sort((a, b) => a - b);
              const imageIndexInSelection = selectedArray.indexOf(image.id);
              const isWithinPackageLimit = imageIndexInSelection !== -1 && imageIndexInSelection < selectedPackage.imageCount;
              
              return (
                <Thumbnail
                  key={image.id}
                  image={image.url}
                  filename={image.filename}
                  alt={image.alt}
                  variant={image.variant}
                  isSelected={isCurrentSelected}
                  isDisabled={false}
                  isPackageImage={isWithinPackageLimit}
                  hasNote={!!imageNotes[image.id]?.trim()}
                  mediaType={image.mediaType}
                  thumbnailUrl={image.thumbnailUrl}
                  duration={image.duration}
                  onSelect={(e) => {
                    e.stopPropagation();
                    toggleImageSelection(image.id);
                  }}
                  onClick={() => handleThumbnailClick(image.url, image.filename, image.id)}
                />
              );
            })}
          </Masonry>
        </ResponsiveMasonry>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredImages.length}
          />
        )}
      </div>
      
      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedImages.size}
        onDownloadSelected={handleDownloadSelected}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        totalCount={galleryImages.length}
        maxSelection={undefined}
        packageCount={imagesInPackage}
        additionalCount={additionalImagesCount}
      />

      {/* Style Guide */}
      <StyleGuide />
      
      {/* Modals */}
      <ImagePreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })}
        image={previewModal.image}
        filename={previewModal.filename}
        onRequestEdit={handleRequestEdit}
        // Navigation
        onNext={handlePreviewNext}
        onPrevious={handlePreviewPrevious}
        hasNext={filteredImages.findIndex(img => img.id === previewModal.imageId) < filteredImages.length - 1}
        hasPrevious={filteredImages.findIndex(img => img.id === previewModal.imageId) > 0}
        currentIndex={filteredImages.findIndex(img => img.id === previewModal.imageId)}
        totalImages={filteredImages.length}
        // Auswahl
        isSelected={selectedImages.has(previewModal.imageId)}
        onToggleSelection={handleToggleSelectionInPreview}
        isPackageImage={(() => {
          const selectedArray = Array.from(selectedImages).sort((a, b) => a - b);
          const imageIndexInSelection = selectedArray.indexOf(previewModal.imageId);
          return imageIndexInSelection !== -1 && imageIndexInSelection < selectedPackage.imageCount;
        })()}
        // Bildinformationen
        alt={galleryImages.find(img => img.id === previewModal.imageId)?.alt}
        // Notizen
        note={imageNotes[previewModal.imageId] || ''}
        onNoteChange={(note) => handleNoteChange(previewModal.imageId, note)}
        // Media Type
        mediaType={galleryImages.find(img => img.id === previewModal.imageId)?.mediaType || 'image'}
      />
      
      <EditRequestModal
        isOpen={editRequestModal}
        onClose={() => setEditRequestModal(false)}
        onStartAnnotation={handleStartAnnotation}
        onSubmit={handleSubmitEdit}
      />
      
      <AnnotationOverlay
        isOpen={annotationOverlay.isOpen}
        onClose={() => setAnnotationOverlay({ ...annotationOverlay, isOpen: false })}
        onSave={handleSaveAnnotation}
        image={annotationOverlay.image}
        filename={annotationOverlay.filename}
      />

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}
