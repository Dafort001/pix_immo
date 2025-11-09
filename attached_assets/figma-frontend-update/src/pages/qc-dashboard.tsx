import { useState } from 'react';
import { Link } from 'wouter';
import {
  ChevronRight,
  Check,
  X,
  MessageSquare,
  ZoomIn,
  Download,
  Filter,
  Menu,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

type ImageStatus = 'pending' | 'approved' | 'rejected';

interface QCImage {
  id: string;
  url: string;
  filename: string;
  status: ImageStatus;
  comment?: string;
}

export default function QCDashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<ImageStatus | 'all'>('all');
  const [lightboxImage, setLightboxImage] = useState<QCImage | null>(null);
  const [comment, setComment] = useState('');

  // Mock data
  const jobId = 'JOB-2024-1105';
  const [images, setImages] = useState<QCImage[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', filename: 'living-room-01.jpg', status: 'approved' },
    { id: '2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c', filename: 'kitchen-01.jpg', status: 'pending' },
    { id: '3', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3', filename: 'bedroom-01.jpg', status: 'pending' },
    { id: '4', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c', filename: 'bathroom-01.jpg', status: 'rejected', comment: 'Fensterreflexion zu stark' },
    { id: '5', url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b', filename: 'exterior-01.jpg', status: 'approved' },
    { id: '6', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea', filename: 'living-room-02.jpg', status: 'pending' },
    { id: '7', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc', filename: 'kitchen-02.jpg', status: 'approved' },
    { id: '8', url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d', filename: 'bedroom-02.jpg', status: 'pending' },
  ]);

  const approvedCount = images.filter(img => img.status === 'approved').length;
  const pendingCount = images.filter(img => img.status === 'pending').length;
  const rejectedCount = images.filter(img => img.status === 'rejected').length;

  const filteredImages = selectedFilter === 'all' 
    ? images 
    : images.filter(img => img.status === selectedFilter);

  const handleStatusChange = (imageId: string, newStatus: ImageStatus, newComment?: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, status: newStatus, comment: newComment } 
        : img
    ));
  };

  const handleApprove = (image: QCImage) => {
    handleStatusChange(image.id, 'approved');
    if (lightboxImage?.id === image.id) {
      setLightboxImage({ ...image, status: 'approved' });
    }
  };

  const handleReject = (image: QCImage) => {
    const userComment = comment.trim() || 'Bitte überarbeiten';
    handleStatusChange(image.id, 'rejected', userComment);
    if (lightboxImage?.id === image.id) {
      setLightboxImage({ ...image, status: 'rejected', comment: userComment });
      setComment('');
    }
  };

  const getStatusBadge = (status: ImageStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-[#64BF49] text-white hover:bg-[#64BF49]">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-[#C94B38] text-white hover:bg-[#C94B38]">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-[#C9B55A] text-white hover:bg-[#C9B55A]">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <span className="text-2xl tracking-tight">PIX.IMMO</span>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/admin-dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Abmelden</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E9E9E9] py-4 px-4">
          <nav className="flex flex-col gap-2">
            <Link href="/admin-dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-[#8E9094]">
            <Link href="/admin-dashboard" className="hover:text-[#1A1A1C]">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="hover:text-[#1A1A1C]">QC</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[#1A1A1C]">{jobId}</span>
          </div>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Approved</div>
              <div className="text-2xl">{approvedCount}</div>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Pending</div>
              <div className="text-2xl">{pendingCount}</div>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Rejected</div>
              <div className="text-2xl">{rejectedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group bg-white rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setLightboxImage(image)}
            >
              <div className="aspect-[4/3] relative">
                <ImageWithFallback
                  src={image.url}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(image.status)}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    className="bg-[#64BF49] hover:bg-[#64BF49]/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(image);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#C94B38] hover:bg-[#C94B38]/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(image);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage(image);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm truncate">{image.filename}</div>
                {image.comment && (
                  <div className="text-xs text-[#8E9094] mt-1 truncate">{image.comment}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Bar (Footer) */}
      <div className="bg-white border-t border-[#E9E9E9] sticky bottom-0">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All ({images.length})
            </Button>
            <Button
              variant={selectedFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('pending')}
              className={selectedFilter === 'pending' ? 'bg-[#C9B55A] hover:bg-[#C9B55A]/90' : ''}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              variant={selectedFilter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('approved')}
              className={selectedFilter === 'approved' ? 'bg-[#64BF49] hover:bg-[#64BF49]/90' : ''}
            >
              Approved ({approvedCount})
            </Button>
            <Button
              variant={selectedFilter === 'rejected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('rejected')}
              className={selectedFilter === 'rejected' ? 'bg-[#C94B38] hover:bg-[#C94B38]/90' : ''}
            >
              Rejected ({rejectedCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col lg:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 bg-[#F8F9FA] flex items-center justify-center p-4 lg:p-8">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.filename}
                className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain"
              />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-white flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#E9E9E9] flex items-center justify-between">
                <h3 className="text-2xl truncate">{lightboxImage.filename}</h3>
                <button onClick={() => setLightboxImage(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status */}
              <div className="p-4 border-b border-[#E9E9E9]">
                <div className="text-sm text-[#8E9094] mb-2">Status</div>
                {getStatusBadge(lightboxImage.status)}
              </div>

              {/* Comment Section */}
              <div className="flex-1 p-4 flex flex-col gap-4">
                <div>
                  <label className="text-sm text-[#8E9094] mb-2 block">Kommentar</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Notiz hinzufügen..."
                    className="min-h-[100px]"
                  />
                </div>

                {lightboxImage.comment && (
                  <div className="bg-[#F8F9FA] p-3 rounded-lg">
                    <div className="text-sm text-[#8E9094] mb-1">Vorheriger Kommentar</div>
                    <div className="text-sm">{lightboxImage.comment}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-[#E9E9E9] flex gap-2">
                <Button
                  className="flex-1 bg-[#64BF49] hover:bg-[#64BF49]/90"
                  onClick={() => handleApprove(lightboxImage)}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  className="flex-1 bg-[#C94B38] hover:bg-[#C94B38]/90"
                  onClick={() => handleReject(lightboxImage)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E9E9] mt-auto">
        <div className="h-32"></div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#8E9094]">
            <div>© 2024 PIX.IMMO. Alle Rechte vorbehalten.</div>
            <div className="flex gap-6">
              <Link href="/impressum" className="hover:text-[#1A1A1C]">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-[#1A1A1C]">Datenschutz</Link>
              <Link href="/agb" className="hover:text-[#1A1A1C]">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
