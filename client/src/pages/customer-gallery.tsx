import { useState } from 'react';
import Masonry from 'react-responsive-masonry';
import { Header } from '@/components/gallery/header';
import { FilterBar, FilterType } from '@/components/gallery/filter-bar';
import { GalleryStats } from '@/components/gallery/gallery-stats';
import { PackageSelector, PackageType } from '@/components/gallery/package-selector';
import { Thumbnail } from '@/components/gallery/thumbnail';
import { BulkActions } from '@/components/gallery/bulk-actions';
import { Pagination } from '@/components/gallery/pagination';
import { ImagePreviewModal } from '@/components/gallery/image-preview-modal';
import { EditRequestModal } from '@/components/gallery/edit-request-modal';
import { AnnotationOverlay } from '@/components/gallery/annotation-overlay';
import { useLocation } from 'wouter';

// TODO: Backend Integration
// - Use existing /api/jobs/:id/gallery endpoint for fetching gallery data
// - Create POST /api/jobs/:id/images/:imageId/select for toggling selection
// - Create PATCH /api/jobs/:id/images/:imageId/note for saving notes
// - Create POST /api/jobs/:id/images/:imageId/edit-request for edit requests
// - Integrate with TanStack Query for data fetching and mutations

// Mock-Daten für die Galerie (demonstriert alle UI-Funktionen)
const mockImages = Array.from({ length: 45 }, (_, i) => ({
  id: `img-${i + 1}`,
  url: `https://picsum.photos/seed/${i + 1}/800/600`,
  filename: `IMG_${String(i + 1).padStart(4, '0')}.jpg`,
  alt: `Immobilienfoto ${i + 1} - ${['Wohnzimmer', 'Küche', 'Schlafzimmer', 'Bad', 'Außenansicht', 'Garten'][i % 6]}`,
  variant: (['normal', 'normal', 'normal', 'locked', 'editing'] as const)[i % 5],
  mediaType: (i % 10 === 0 ? 'video' : 'image') as 'image' | 'video',
  thumbnailUrl: i % 10 === 0 ? `https://picsum.photos/seed/${i + 1}/800/600` : undefined,
  duration: i % 10 === 0 ? 45 + (i % 5) * 15 : undefined,
  hasNote: i % 7 === 0,
  note: i % 7 === 0 ? 'Zu dunkel, bitte aufhellen' : '',
}));

const packages: PackageType[] = [
  { id: 'basis', name: 'Basis', imageCount: 10, price: 180, pricePerAdditionalImage: 6 },
  { id: 'standard', name: 'Standard', imageCount: 20, price: 220, pricePerAdditionalImage: 6 },
  { id: 'premium', name: 'Premium', imageCount: 40, price: 300, pricePerAdditionalImage: 6 },
];

export default function CustomerGallery() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedPackage, setSelectedPackage] = useState<PackageType>(packages[0]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [imageNotes, setImageNotes] = useState<Record<string, string>>({});
  
  // Modal states
  const [previewImage, setPreviewImage] = useState<number | null>(null);
  const [editRequestModalOpen, setEditRequestModalOpen] = useState(false);
  const [annotationImage, setAnnotationImage] = useState<{ url: string; filename: string } | null>(null);

  const itemsPerPage = 12;

  // Filter images
  const filteredImages = mockImages.filter((img) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'normal') return img.variant === 'normal';
    if (activeFilter === 'selected') return selectedImages.has(img.id);
    if (activeFilter === 'locked') return img.variant === 'locked';
    if (activeFilter === 'editing') return img.variant === 'editing';
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const stats = {
    total: mockImages.length,
    selected: selectedImages.size,
    locked: mockImages.filter((img) => img.variant === 'locked').length,
    editing: mockImages.filter((img) => img.variant === 'editing').length,
  };

  // Package logic
  const packageImageCount = selectedImages.size <= selectedPackage.imageCount 
    ? selectedImages.size 
    : selectedPackage.imageCount;
  const additionalImageCount = selectedImages.size > selectedPackage.imageCount 
    ? selectedImages.size - selectedPackage.imageCount 
    : 0;

  const handleToggleSelection = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    const availableImages = mockImages
      .filter((img) => img.variant === 'normal')
      .map((img) => img.id);
    setSelectedImages(new Set(availableImages));
  };

  const handleClearSelection = () => {
    setSelectedImages(new Set());
  };

  const handleDownloadSelected = () => {
    console.log('Downloading selected images:', Array.from(selectedImages));
  };

  const handleDownloadZip = () => {
    console.log('Downloading all images as ZIP');
  };

  const handleNoteChange = (imageId: string, note: string) => {
    setImageNotes((prev) => ({
      ...prev,
      [imageId]: note,
    }));
  };

  const handleEditRequest = (editType: string, description: string) => {
    console.log('Edit request:', editType, description);
  };

  const handleAnnotationSave = (annotationData: string) => {
    console.log('Annotation saved:', annotationData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        jobTitle="Mustermann Immobilie - Einfamilienhaus Hamburg"
        packageSize={`${selectedPackage.name}-Paket (${selectedPackage.imageCount} Bilder)`}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PackageSelector
              packages={packages}
              selectedPackage={selectedPackage}
              onPackageChange={setSelectedPackage}
              additionalImagesCount={additionalImageCount}
            />
            <GalleryStats
              total={stats.total}
              selected={stats.selected}
              locked={stats.locked}
              editing={stats.editing}
            />
          </div>

          {/* Gallery */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter */}
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={{
                all: mockImages.length,
                normal: mockImages.filter((img) => img.variant === 'normal').length,
                selected: stats.selected,
                locked: stats.locked,
                editing: stats.editing,
              }}
            />

            {/* Masonry Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <Masonry columnsCount={3} gutter="16px">
                {paginatedImages.map((image, index) => (
                  <Thumbnail
                    key={image.id}
                    image={image.url}
                    filename={image.filename}
                    alt={image.alt}
                    variant={image.variant}
                    isSelected={selectedImages.has(image.id)}
                    onSelect={(e) => {
                      e.stopPropagation();
                      if (image.variant === 'normal') {
                        handleToggleSelection(image.id);
                      }
                    }}
                    onClick={() => setPreviewImage((currentPage - 1) * itemsPerPage + index)}
                    isDisabled={image.variant !== 'normal'}
                    isPackageImage={
                      selectedImages.has(image.id) && 
                      Array.from(selectedImages).indexOf(image.id) < selectedPackage.imageCount
                    }
                    hasNote={!!imageNotes[image.id] || image.hasNote}
                    mediaType={image.mediaType}
                    thumbnailUrl={image.thumbnailUrl}
                    duration={image.duration}
                  />
                ))}
              </Masonry>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredImages.length}
            />
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedImages.size}
        onDownloadSelected={handleDownloadSelected}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAll}
        totalCount={mockImages.filter((img) => img.variant === 'normal').length}
        packageCount={packageImageCount}
        additionalCount={additionalImageCount}
      />

      {/* Preview Modal */}
      {previewImage !== null && (
        <ImagePreviewModal
          isOpen={true}
          onClose={() => setPreviewImage(null)}
          image={filteredImages[previewImage].url}
          filename={filteredImages[previewImage].filename}
          alt={filteredImages[previewImage].alt}
          mediaType={filteredImages[previewImage].mediaType}
          onRequestEdit={() => {
            setEditRequestModalOpen(true);
          }}
          onNext={
            previewImage < filteredImages.length - 1
              ? () => setPreviewImage(previewImage + 1)
              : undefined
          }
          onPrevious={
            previewImage > 0
              ? () => setPreviewImage(previewImage - 1)
              : undefined
          }
          hasNext={previewImage < filteredImages.length - 1}
          hasPrevious={previewImage > 0}
          currentIndex={previewImage}
          totalImages={filteredImages.length}
          isSelected={selectedImages.has(filteredImages[previewImage].id)}
          onToggleSelection={() => {
            if (filteredImages[previewImage].variant === 'normal') {
              handleToggleSelection(filteredImages[previewImage].id);
            }
          }}
          isPackageImage={
            selectedImages.has(filteredImages[previewImage].id) &&
            Array.from(selectedImages).indexOf(filteredImages[previewImage].id) < 
            selectedPackage.imageCount
          }
          note={imageNotes[filteredImages[previewImage].id] || filteredImages[previewImage].note}
          onNoteChange={(note) => handleNoteChange(filteredImages[previewImage].id, note)}
        />
      )}

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={editRequestModalOpen}
        onClose={() => setEditRequestModalOpen(false)}
        onStartAnnotation={() => {
          if (previewImage !== null) {
            setAnnotationImage({
              url: filteredImages[previewImage].url,
              filename: filteredImages[previewImage].filename,
            });
            setEditRequestModalOpen(false);
          }
        }}
        onSubmit={handleEditRequest}
      />

      {/* Annotation Overlay */}
      {annotationImage && (
        <AnnotationOverlay
          isOpen={true}
          onClose={() => setAnnotationImage(null)}
          image={annotationImage.url}
          filename={annotationImage.filename}
          onSave={handleAnnotationSave}
        />
      )}
    </div>
  );
}
