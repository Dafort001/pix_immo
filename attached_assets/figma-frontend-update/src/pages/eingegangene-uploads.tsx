import { useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Circle,
  Download,
  X,
  Calendar,
  User,
  HardDrive,
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';

type UploadStatus = 'neu' | 'in-pruefung' | 'freigegeben' | 'fehlerhaft';

interface UploadedFile {
  id: string;
  thumbnail: string;
  filename: string;
  roomType: string;
  uploadTime: string;
  photographer: string;
  deviceId: string;
  fileSize: string;
  status: UploadStatus;
  shootCode: string;
  customer: string;
  r2Path: string;
  resolution: string;
  comment: string;
  technicalStatus: 'ok' | 'warning' | 'error';
  version: string;
  hasNamingIssue?: boolean;
  hasNoRoomType?: boolean;
  isCorrupted?: boolean;
}

const mockUploads: UploadedFile[] = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_AB12C_WOHNZIMMER_001_V1.jpg',
    roomType: 'Wohnzimmer',
    uploadTime: '03.11.2025 15:42',
    photographer: 'Max Müller',
    deviceId: 'iPhone15ProMax_A1B2C3',
    fileSize: '8.4 MB',
    status: 'neu',
    shootCode: 'AB12C',
    customer: 'Engel & Völkers Hamburg',
    r2Path: 'uploads/2025/11/03/AB12C/PIXIMMO_AB12C_WOHNZIMMER_001_V1.jpg',
    resolution: '6000 × 4000 px',
    comment: 'Bitte warme Farbkorrektur',
    technicalStatus: 'ok',
    version: 'V1',
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_AB12C_KUECHE_002_V1.jpg',
    roomType: 'Küche',
    uploadTime: '03.11.2025 15:43',
    photographer: 'Max Müller',
    deviceId: 'iPhone15ProMax_A1B2C3',
    fileSize: '7.2 MB',
    status: 'neu',
    shootCode: 'AB12C',
    customer: 'Engel & Völkers Hamburg',
    r2Path: 'uploads/2025/11/03/AB12C/PIXIMMO_AB12C_KUECHE_002_V1.jpg',
    resolution: '6000 × 4000 px',
    comment: '',
    technicalStatus: 'ok',
    version: 'V1',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_AB12C_SCHLAFZIMMER_003_V1.jpg',
    roomType: 'Schlafzimmer',
    uploadTime: '03.11.2025 15:44',
    photographer: 'Max Müller',
    deviceId: 'iPhone15ProMax_A1B2C3',
    fileSize: '6.8 MB',
    status: 'in-pruefung',
    shootCode: 'AB12C',
    customer: 'Engel & Völkers Hamburg',
    r2Path: 'uploads/2025/11/03/AB12C/PIXIMMO_AB12C_SCHLAFZIMMER_003_V1.jpg',
    resolution: '6000 × 4000 px',
    comment: '',
    technicalStatus: 'ok',
    version: 'V1',
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=200&h=200&fit=crop',
    filename: 'IMG_5678.jpg',
    roomType: '',
    uploadTime: '03.11.2025 15:45',
    photographer: 'Anna Schmidt',
    deviceId: 'iPhone14Pro_D4E5F6',
    fileSize: '9.1 MB',
    status: 'neu',
    shootCode: 'CD34E',
    customer: 'Von Poll Immobilien',
    r2Path: 'uploads/2025/11/03/CD34E/IMG_5678.jpg',
    resolution: '5712 × 3808 px',
    comment: 'Außenansicht Balkon',
    technicalStatus: 'warning',
    version: 'V1',
    hasNamingIssue: true,
    hasNoRoomType: true,
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_CD34E_BAD_005_V1.jpg',
    roomType: 'Bad',
    uploadTime: '03.11.2025 15:46',
    photographer: 'Anna Schmidt',
    deviceId: 'iPhone14Pro_D4E5F6',
    fileSize: '7.9 MB',
    status: 'freigegeben',
    shootCode: 'CD34E',
    customer: 'Von Poll Immobilien',
    r2Path: 'uploads/2025/11/03/CD34E/PIXIMMO_CD34E_BAD_005_V1.jpg',
    resolution: '5712 × 3808 px',
    comment: '',
    technicalStatus: 'ok',
    version: 'V1',
  },
  {
    id: '6',
    thumbnail: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_EF56G_FLUR_006_V1.jpg',
    roomType: 'Flur',
    uploadTime: '03.11.2025 15:47',
    photographer: 'Tom Weber',
    deviceId: 'iPhone13_G7H8I9',
    fileSize: '0 KB',
    status: 'fehlerhaft',
    shootCode: 'EF56G',
    customer: 'OTTO Immobilien',
    r2Path: 'uploads/2025/11/03/EF56G/PIXIMMO_EF56G_FLUR_006_V1.jpg',
    resolution: '0 × 0 px',
    comment: '',
    technicalStatus: 'error',
    version: 'V1',
    isCorrupted: true,
  },
  {
    id: '7',
    thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=200&h=200&fit=crop',
    filename: 'balkon_pic.jpg',
    roomType: '',
    uploadTime: '03.11.2025 15:48',
    photographer: 'Tom Weber',
    deviceId: 'iPhone13_G7H8I9',
    fileSize: '8.2 MB',
    status: 'neu',
    shootCode: 'EF56G',
    customer: 'OTTO Immobilien',
    r2Path: 'uploads/2025/11/03/EF56G/balkon_pic.jpg',
    resolution: '4032 × 3024 px',
    comment: '',
    technicalStatus: 'warning',
    version: 'V1',
    hasNamingIssue: true,
    hasNoRoomType: true,
  },
  {
    id: '8',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=200&h=200&fit=crop',
    filename: 'PIXIMMO_AB12C_BALKON_007_V1.jpg',
    roomType: 'Balkon',
    uploadTime: '03.11.2025 15:49',
    photographer: 'Max Müller',
    deviceId: 'iPhone15ProMax_A1B2C3',
    fileSize: '9.3 MB',
    status: 'neu',
    shootCode: 'AB12C',
    customer: 'Engel & Völkers Hamburg',
    r2Path: 'uploads/2025/11/03/AB12C/PIXIMMO_AB12C_BALKON_007_V1.jpg',
    resolution: '6000 × 4000 px',
    comment: '',
    technicalStatus: 'ok',
    version: 'V1',
  },
  {
    id: '9',
    thumbnail: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=200&h=200&fit=crop',
    filename: 'IMG_9876.jpg',
    roomType: '',
    uploadTime: '03.11.2025 15:50',
    photographer: 'Lisa Becker',
    deviceId: 'iPhone15_J1K2L3',
    fileSize: '7.6 MB',
    status: 'neu',
    shootCode: 'GH78I',
    customer: 'Engel & Völkers Hamburg',
    r2Path: 'uploads/2025/11/03/GH78I/IMG_9876.jpg',
    resolution: '6000 × 4000 px',
    comment: 'Aussenansicht',
    technicalStatus: 'warning',
    version: 'V1',
    hasNamingIssue: true,
    hasNoRoomType: true,
  },
];

export default function EingegangeneUploads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('alle');
  const [customerFilter, setCustomerFilter] = useState('alle');
  const [statusFilter, setStatusFilter] = useState('alle');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Calculate banner counts
  const noRoomTypeCount = mockUploads.filter((u) => u.hasNoRoomType).length;
  const namingIssueCount = mockUploads.filter((u) => u.hasNamingIssue).length;
  const corruptedCount = mockUploads.filter((u) => u.isCorrupted).length;

  // Filter uploads
  const filteredUploads = mockUploads.filter((upload) => {
    const matchesSearch =
      upload.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      upload.shootCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTime =
      timeFilter === 'alle' ||
      (timeFilter === 'heute' && upload.uploadTime.includes('03.11.2025')) ||
      (timeFilter === 'woche' && upload.uploadTime.includes('11.2025'));

    const matchesCustomer = customerFilter === 'alle' || upload.customer === customerFilter;

    const matchesStatus = statusFilter === 'alle' || upload.status === statusFilter;

    return matchesSearch && matchesTime && matchesCustomer && matchesStatus;
  });

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const toggleAllFiles = () => {
    if (selectedFiles.length === filteredUploads.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredUploads.map((u) => u.id));
    }
  };

  const getStatusIcon = (status: UploadStatus) => {
    switch (status) {
      case 'neu':
        return <Circle className="w-4 h-4 text-[#8E9094] fill-[#8E9094]" />;
      case 'in-pruefung':
        return <Circle className="w-4 h-4 text-[#C9B55A] fill-[#C9B55A]" />;
      case 'freigegeben':
        return <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />;
      case 'fehlerhaft':
        return <XCircle className="w-4 h-4 text-[#C94B38]" />;
    }
  };

  const getStatusLabel = (status: UploadStatus) => {
    switch (status) {
      case 'neu':
        return 'Neu';
      case 'in-pruefung':
        return 'In Prüfung';
      case 'freigegeben':
        return 'Freigegeben';
      case 'fehlerhaft':
        return 'Fehlerhaft';
    }
  };

  const currentTime = new Date().toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E5E5] px-6 py-4 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin-dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <Link href="/">
                <span className="text-[#1A1A1C] cursor-pointer">PIX.IMMO</span>
              </Link>
            </div>
            <h1 className="text-[#1A1A1C] absolute left-1/2 -translate-x-1/2">Eingegangene Uploads</h1>
            <div className="flex items-center gap-3">
              <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9094]" />
                <Input
                  type="text"
                  placeholder="Suche nach Datei oder Shoot-Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg border-[#E5E5E5]"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm"
            >
              <option value="alle">Alle Zeiträume</option>
              <option value="heute">Heute</option>
              <option value="woche">Diese Woche</option>
            </select>

            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm"
            >
              <option value="alle">Alle Kunden</option>
              <option value="Engel & Völkers Hamburg">Engel & Völkers Hamburg</option>
              <option value="Von Poll Immobilien">Von Poll Immobilien</option>
              <option value="OTTO Immobilien">OTTO Immobilien</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm"
            >
              <option value="alle">Alle Status</option>
              <option value="neu">Neu</option>
              <option value="in-pruefung">In Prüfung</option>
              <option value="freigegeben">Freigegeben</option>
              <option value="fehlerhaft">Fehlerhaft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Banner Alerts */}
        <div className="space-y-2 mb-4">
          {noRoomTypeCount > 0 && (
            <div className="bg-[#FFF9E6] border border-[#E5D68A] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#C9B55A]" />
                <span className="text-sm text-[#1A1A1C]">
                  {noRoomTypeCount} Bilder ohne Raumtyp – bitte zuordnen.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('neu')}
                className="text-[#C9B55A] hover:text-[#B8A44A]"
              >
                Anzeigen
              </Button>
            </div>
          )}

          {namingIssueCount > 0 && (
            <div className="bg-[#FFF4E6] border border-[#FFD699] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#FF9933]" />
                <span className="text-sm text-[#1A1A1C]">
                  {namingIssueCount} Dateien weichen von der Benennungsregel v3.1 ab.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('neu')}
                className="text-[#FF9933] hover:text-[#E68A2E]"
              >
                Anzeigen
              </Button>
            </div>
          )}

          {corruptedCount > 0 && (
            <div className="bg-[#FFEBEB] border border-[#FFB3B3] rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-[#C94B38]" />
                <span className="text-sm text-[#1A1A1C]">
                  {corruptedCount} Bilder beschädigt oder unlesbar.
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('fehlerhaft')}
                className="text-[#C94B38] hover:text-[#B3442F]"
              >
                Anzeigen
              </Button>
            </div>
          )}
        </div>

        {/* Batch Actions */}
        {selectedFiles.length > 0 && (
          <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm">
            <span className="text-sm text-[#1A1A1C]">{selectedFiles.length} ausgewählt</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowConfirmDialog(true)}
                className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg h-9 px-4"
              >
                Freigeben für QC
              </Button>
              <Button variant="outline" className="rounded-lg h-9 px-4">
                Zurückweisen
              </Button>
              <Button variant="outline" className="rounded-lg h-9 px-4">
                Raumtypen neu zuordnen
              </Button>
              <Button variant="outline" className="rounded-lg h-9 px-4">
                <Download className="w-4 h-4 mr-2" />
                ZIP herunterladen
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Table/Grid Area */}
          <div className="flex-1">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-[#E5E5E5]">
              <table className="w-full">
                <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <Checkbox
                        checked={
                          selectedFiles.length === filteredUploads.length &&
                          filteredUploads.length > 0
                        }
                        onCheckedChange={toggleAllFiles}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Vorschau</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Dateiname</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Raumtyp</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Upload</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Fotograf</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Größe</th>
                    <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUploads.map((upload) => (
                    <tr
                      key={upload.id}
                      className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                      onClick={() => setSelectedFile(upload)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedFiles.includes(upload.id)}
                          onCheckedChange={() => toggleFileSelection(upload.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={upload.thumbnail}
                          alt={upload.filename}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#1A1A1C]">{upload.filename}</span>
                          {upload.hasNamingIssue && (
                            <AlertCircle className="w-4 h-4 text-[#FF9933]" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {upload.roomType ? (
                          <Badge variant="outline" className="text-sm">
                            {upload.roomType}
                          </Badge>
                        ) : (
                          <span className="text-sm text-[#8E9094]">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8E9094]">{upload.uploadTime}</td>
                      <td className="px-4 py-3 text-sm text-[#8E9094]">{upload.photographer}</td>
                      <td className="px-4 py-3 text-sm text-[#8E9094]">{upload.fileSize}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(upload.status)}
                          <span className="text-sm text-[#8E9094]">
                            {getStatusLabel(upload.status)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Grid View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-[#E5E5E5]"
                  onClick={() => setSelectedFile(upload)}
                >
                  <div className="flex gap-3">
                    <Checkbox
                      checked={selectedFiles.includes(upload.id)}
                      onCheckedChange={() => toggleFileSelection(upload.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <img
                      src={upload.thumbnail}
                      alt={upload.filename}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#1A1A1C] truncate mb-1">{upload.filename}</p>
                      <p className="text-xs text-[#8E9094] mb-1">{upload.roomType || 'Kein Raumtyp'}</p>
                      <p className="text-xs text-[#8E9094] mb-2">{upload.uploadTime}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(upload.status)}
                        <span className="text-xs text-[#8E9094]">
                          {getStatusLabel(upload.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedFile && (
            <div
              className="hidden lg:block bg-white rounded-lg shadow-lg border border-[#E5E5E5] sticky top-24"
              style={{ width: '400px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
                <h3 className="text-[#1A1A1C]">Dateidetails</h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-[#FAFAFA] rounded"
                >
                  <X className="w-5 h-5 text-[#8E9094]" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="p-4">
                <img
                  src={selectedFile.thumbnail}
                  alt={selectedFile.filename}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* Metadata */}
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="text-xs text-[#8E9094] mb-1 block">Dateiname</label>
                  <p className="text-sm text-[#1A1A1C] break-words">{selectedFile.filename}</p>
                </div>

                <div>
                  <label className="text-xs text-[#8E9094] mb-1 block">R2-Pfad</label>
                  <p className="text-sm text-[#1A1A1C] break-words font-mono bg-[#FAFAFA] px-2 py-1 rounded">
                    {selectedFile.r2Path}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Upload-Zeit</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.uploadTime}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Shoot-Code</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.shootCode}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#8E9094] mb-1 block">Kunde</label>
                  <p className="text-sm text-[#1A1A1C]">{selectedFile.customer}</p>
                </div>

                <div>
                  <label className="text-xs text-[#8E9094] mb-1 block">Fotograf / Device-ID</label>
                  <p className="text-sm text-[#1A1A1C]">{selectedFile.photographer}</p>
                  <p className="text-xs text-[#8E9094] font-mono">{selectedFile.deviceId}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Raumtyp</label>
                    <p className="text-sm text-[#1A1A1C]">
                      {selectedFile.roomType || <span className="text-[#C94B38]">Nicht zugeordnet</span>}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Version</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.version}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Auflösung</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.resolution}</p>
                  </div>
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Dateigröße</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.fileSize}</p>
                  </div>
                </div>

                {selectedFile.comment && (
                  <div>
                    <label className="text-xs text-[#8E9094] mb-1 block">Kommentar</label>
                    <p className="text-sm text-[#1A1A1C]">{selectedFile.comment}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs text-[#8E9094] mb-1 block">Technischer Zustand</label>
                  <div className="flex items-center gap-2">
                    {selectedFile.technicalStatus === 'ok' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />
                        <span className="text-sm text-[#64BF49]">OK</span>
                      </>
                    )}
                    {selectedFile.technicalStatus === 'warning' && (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#FF9933]" />
                        <span className="text-sm text-[#FF9933]">Warnung</span>
                      </>
                    )}
                    {selectedFile.technicalStatus === 'error' && (
                      <>
                        <XCircle className="w-4 h-4 text-[#C94B38]" />
                        <span className="text-sm text-[#C94B38]">Fehler</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-[#E5E5E5] space-y-2">
                <Button className="w-full bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg h-10">
                  In QC freigeben
                </Button>
                <Button variant="outline" className="w-full rounded-lg h-10">
                  Raumtyp korrigieren
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-lg h-10 text-[#8E9094] border-[#E5E5E5]"
                >
                  Zurück an Fotografen
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E5E5] px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#8E9094]">
            <Clock className="w-4 h-4" />
            <span>Letztes Update: {currentTime} Uhr</span>
            <span>·</span>
            <ImageIcon className="w-4 h-4" />
            <span>{filteredUploads.length} Bilder</span>
            <span>·</span>
            <HardDrive className="w-4 h-4" />
            <span>Upload-Server piximmo-intake-01</span>
          </div>
          <Button variant="ghost" size="sm" className="text-[#8E9094] hover:text-[#1A1A1C]">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-[#1A1A1C] mb-4">Diese Bilder an die Qualitätskontrolle weitergeben?</h3>
            <p className="text-sm text-[#8E9094] mb-6">
              {selectedFiles.length} Datei(en) werden für die QC freigegeben und können danach bearbeitet werden.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="rounded-lg"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedFiles([]);
                }}
                className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg"
              >
                Freigeben
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
