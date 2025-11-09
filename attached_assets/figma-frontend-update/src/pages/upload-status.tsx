import { useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  Filter,
  Info,
  ArrowLeft,
  Menu,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';

type UploadImageStatus = 
  | 'uploaded' 
  | 'processed' 
  | 'qc-pending' 
  | 'qc-approved' 
  | 'qc-rejected' 
  | 'delivered';

interface UploadImage {
  id: string;
  url: string;
  filename: string;
  status: UploadImageStatus;
  lastUpdate: string;
  updatedBy?: string;
  comment?: string;
}

export default function UploadStatus() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<UploadImageStatus | 'all'>('all');

  const jobCode = 'JOB-2024-1105';
  const shootingDate = '28.10.2024';

  const images: UploadImage[] = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
      filename: 'living-room-01.jpg',
      status: 'delivered',
      lastUpdate: '05.11.2024 14:30',
      updatedBy: 'Admin',
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
      filename: 'kitchen-01.jpg',
      status: 'qc-approved',
      lastUpdate: '05.11.2024 12:15',
      updatedBy: 'QC Team',
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
      filename: 'bedroom-01.jpg',
      status: 'qc-pending',
      lastUpdate: '05.11.2024 10:20',
      updatedBy: 'Editor',
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      filename: 'bathroom-01.jpg',
      status: 'qc-rejected',
      lastUpdate: '04.11.2024 16:45',
      updatedBy: 'QC Team',
      comment: 'Fensterreflexion zu stark',
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b',
      filename: 'exterior-01.jpg',
      status: 'delivered',
      lastUpdate: '05.11.2024 14:30',
      updatedBy: 'Admin',
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea',
      filename: 'living-room-02.jpg',
      status: 'processed',
      lastUpdate: '03.11.2024 09:10',
      updatedBy: 'System',
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc',
      filename: 'kitchen-02.jpg',
      status: 'qc-approved',
      lastUpdate: '05.11.2024 11:05',
      updatedBy: 'QC Team',
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      filename: 'bedroom-02.jpg',
      status: 'uploaded',
      lastUpdate: '02.11.2024 18:30',
      updatedBy: 'Kunde',
    },
  ];

  const getStatusBadge = (status: UploadImageStatus) => {
    const statusConfig = {
      uploaded: { label: 'Uploaded', color: 'bg-[#8E9094]' },
      processed: { label: 'Processed', color: 'bg-[#74A4EA]' },
      'qc-pending': { label: 'QC Pending', color: 'bg-[#C9B55A]' },
      'qc-approved': { label: 'QC Approved', color: 'bg-[#64BF49]' },
      'qc-rejected': { label: 'QC Rejected', color: 'bg-[#C94B38]' },
      delivered: { label: 'Delivered', color: 'bg-[#1A1A1C]' },
    };

    const config = statusConfig[status];
    return (
      <Badge className={`${config.color} text-white hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || image.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const approvedCount = images.filter((img) => img.status === 'qc-approved' || img.status === 'delivered').length;
  const totalCount = images.length;
  const progressPercentage = (approvedCount / totalCount) * 100;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
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
              <Link href="/dashboard">
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
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Job Info Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl mb-1">Upload Status</h1>
              <div className="flex items-center gap-4 text-sm text-[#8E9094]">
                <span>Job-Code: {jobCode}</span>
                <span>•</span>
                <span>Shooting-Datum: {shootingDate}</span>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:min-w-[300px]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-[#8E9094]">Fortschritt</div>
                <div className="text-sm">
                  {approvedCount} / {totalCount} approved
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E9094]" />
              <Input
                type="text"
                placeholder="Dateinamen suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                All ({images.length})
              </Button>
              <Button
                variant={selectedFilter === 'qc-rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('qc-rejected')}
                className={selectedFilter === 'qc-rejected' ? 'bg-[#C94B38] hover:bg-[#C94B38]/90' : ''}
              >
                Rejected ({images.filter((img) => img.status === 'qc-rejected').length})
              </Button>
              <Button
                variant={selectedFilter === 'qc-pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('qc-pending')}
                className={selectedFilter === 'qc-pending' ? 'bg-[#C9B55A] hover:bg-[#C9B55A]/90' : ''}
              >
                Pending ({images.filter((img) => img.status === 'qc-pending').length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <div className="text-2xl mb-2">Keine Bilder gefunden</div>
            <p className="text-[#8E9094]">
              Versuchen Sie einen anderen Suchbegriff oder Filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredImages.map((image) => (
              <TooltipProvider key={image.id}>
                <div className="bg-white rounded-lg overflow-hidden group">
                  <div className="aspect-[4/3] relative">
                    <ImageWithFallback
                      src={image.url}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{getStatusBadge(image.status)}</div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="text-xs space-y-1">
                            <div>Letzte Änderung: {image.lastUpdate}</div>
                            {image.updatedBy && <div>Durch: {image.updatedBy}</div>}
                            {image.comment && <div className="mt-2 text-[#8E9094]">{image.comment}</div>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-sm truncate mb-1">{image.filename}</div>
                    <div className="text-xs text-[#8E9094]">{image.lastUpdate}</div>
                  </div>
                </div>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>

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
