import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  Image as ImageIcon,
  Calendar,
  User,
  ArrowUpRight,
  Download,
  Send,
  Smartphone,
  Camera,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

type JobStatus = 'neu' | 'in-bearbeitung' | 'revision' | 'fertig' | 'geliefert';
type UploadSource = 'app' | 'professional';

interface EditorJob {
  id: string;
  jobId: string;
  customer: string;
  property: string;
  uploadDate: string;
  dueDate: string;
  imageCount: number;
  status: JobStatus;
  source: UploadSource;
  editor?: string;
  priority: 'normal' | 'hoch' | 'dringend';
  thumbnail: string;
  revisionCount?: number;
}

const mockJobs: EditorJob[] = [
  {
    id: '1',
    jobId: '20251106-AB123',
    customer: 'Engel & Völkers Hamburg',
    property: 'Elbchaussee 142, 22763 Hamburg',
    uploadDate: '2025-11-06 14:30',
    dueDate: '2025-11-07 18:00',
    imageCount: 24,
    status: 'neu',
    source: 'app',
    priority: 'dringend',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
  },
  {
    id: '2',
    jobId: '20251106-CD456',
    customer: 'Hamburger Sparkasse Immobilien',
    property: 'Rothenbaumchaussee 5, 20148 Hamburg',
    uploadDate: '2025-11-06 11:15',
    dueDate: '2025-11-08 12:00',
    imageCount: 18,
    status: 'in-bearbeitung',
    source: 'professional',
    editor: 'Sarah M.',
    priority: 'hoch',
    thumbnail: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400',
  },
  {
    id: '3',
    jobId: '20251105-EF789',
    customer: 'OTTO Immobilien',
    property: 'Wandsbeker Zollstraße 87, 22041 Hamburg',
    uploadDate: '2025-11-05 16:20',
    dueDate: '2025-11-07 10:00',
    imageCount: 32,
    status: 'revision',
    source: 'app',
    editor: 'Tom K.',
    priority: 'normal',
    thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400',
    revisionCount: 2,
  },
  {
    id: '4',
    jobId: '20251105-GH012',
    customer: 'Dahler & Company',
    property: 'Elbchaussee 220, 22605 Hamburg',
    uploadDate: '2025-11-05 09:45',
    dueDate: '2025-11-06 16:00',
    imageCount: 28,
    status: 'fertig',
    source: 'professional',
    editor: 'Sarah M.',
    priority: 'normal',
    thumbnail: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400',
  },
  {
    id: '5',
    jobId: '20251104-IJ345',
    customer: 'Century 21 Hamburg',
    property: 'Hoheluftchaussee 95, 20253 Hamburg',
    uploadDate: '2025-11-04 13:30',
    dueDate: '2025-11-05 18:00',
    imageCount: 20,
    status: 'geliefert',
    source: 'professional',
    editor: 'Tom K.',
    priority: 'normal',
    thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400',
  },
];

export default function EditorDashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'alle'>('alle');
  const [priorityFilter, setPriorityFilter] = useState<'alle' | 'normal' | 'hoch' | 'dringend'>('alle');
  const [sourceFilter, setSourceFilter] = useState<'alle' | 'app' | 'professional'>('alle');

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'alle' || job.status === statusFilter;
    const matchesPriority = priorityFilter === 'alle' || job.priority === priorityFilter;
    const matchesSource = sourceFilter === 'alle' || job.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const getSourceBadge = (source: UploadSource) => {
    return source === 'app' ? (
      <Badge variant="outline" className="bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20">
        <Smartphone className="h-3 w-3 mr-1" />
        App
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-[#1A1A1C]/10 text-[#1A1A1C] border-[#1A1A1C]/20">
        <Camera className="h-3 w-3 mr-1" />
        Pro
      </Badge>
    );
  };

  const getStatusBadge = (status: JobStatus) => {
    const styles = {
      neu: 'bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20',
      'in-bearbeitung': 'bg-[#64BF49]/10 text-[#64BF49] border-[#64BF49]/20',
      revision: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      fertig: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      geliefert: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };

    const labels = {
      neu: 'Neu',
      'in-bearbeitung': 'In Bearbeitung',
      revision: 'Revision',
      fertig: 'Fertig',
      geliefert: 'Geliefert',
    };

    return (
      <Badge variant="outline" className={styles[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: 'normal' | 'hoch' | 'dringend') => {
    if (priority === 'normal') return null;

    const styles = {
      hoch: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      dringend: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    const labels = {
      hoch: 'Hohe Priorität',
      dringend: '🔥 Dringend',
    };

    return (
      <Badge variant="outline" className={`${styles[priority]} ml-2`}>
        {labels[priority]}
      </Badge>
    );
  };

  const stats = {
    neu: mockJobs.filter((j) => j.status === 'neu').length,
    inBearbeitung: mockJobs.filter((j) => j.status === 'in-bearbeitung').length,
    revision: mockJobs.filter((j) => j.status === 'revision').length,
    fertig: mockJobs.filter((j) => j.status === 'fertig').length,
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead
        title="Editor Dashboard – pix.immo"
        description="Bearbeitungsübersicht für Immobilienfotos"
        path="/editor-dashboard"
      />

      {/* Header */}
      <header className="bg-[#1A1A1C] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[32pt] mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                Editor Dashboard
              </h1>
              <p className="text-[#A3A3A3]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                Übersicht aller zu bearbeitenden Jobs
              </p>
            </div>
            <Button
              className="bg-[#64BF49] text-white hover:opacity-90"
              style={{ borderRadius: '0px', height: '44px', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600 }}
            >
              <Download className="h-5 w-5 mr-2" />
              Batch Download
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#74A4EA]/10 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-[#74A4EA]" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.neu}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Neue Jobs</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#64BF49]/10 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[#64BF49]" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.inBearbeitung}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">In Bearbeitung</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.revision}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Revisionen</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.fertig}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Fertig</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280]" />
              <Input
                type="text"
                placeholder="Job-ID, Kunde oder Adresse suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Status</SelectItem>
                <SelectItem value="neu">Neu</SelectItem>
                <SelectItem value="in-bearbeitung">In Bearbeitung</SelectItem>
                <SelectItem value="revision">Revision</SelectItem>
                <SelectItem value="fertig">Fertig</SelectItem>
                <SelectItem value="geliefert">Geliefert</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder="Priorität filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Prioritäten</SelectItem>
                <SelectItem value="dringend">Dringend</SelectItem>
                <SelectItem value="hoch">Hoch</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            {/* Source Filter */}
            <Select value={sourceFilter} onValueChange={(value: any) => setSourceFilter(value)}>
              <SelectTrigger className="w-[200px] h-11">
                <SelectValue placeholder="Quelle filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Quellen</SelectItem>
                <SelectItem value="app">App-Uploads</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setLocation(`/editor-job-detail?id=${job.jobId}`)}
              className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-6">
                {/* Thumbnail */}
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-[#F0F0F0]">
                  <img src={job.thumbnail} alt={job.property} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-[#111111]"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
                        >
                          {job.jobId}
                        </h3>
                        {getStatusBadge(job.status)}
                        {getSourceBadge(job.source)}
                        {getPriorityBadge(job.priority)}
                      </div>
                      <p
                        className="text-[#6B7280] mb-1"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}
                      >
                        {job.customer}
                      </p>
                      <p
                        className="text-[#6B7280]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '13pt' }}
                      >
                        {job.property}
                      </p>
                    </div>

                    <ArrowUpRight className="h-5 w-5 text-[#6B7280] group-hover:text-[#111111] transition-colors" />
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-6 text-[#6B7280]" style={{ fontSize: '13pt' }}>
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <span>{job.imageCount} Bilder</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Upload: {new Date(job.uploadDate).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        Deadline:{' '}
                        <span className={job.priority === 'dringend' ? 'text-red-600 font-semibold' : ''}>
                          {new Date(job.dueDate).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>
                    {job.editor && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{job.editor}</span>
                      </div>
                    )}
                    {job.revisionCount && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        <span className="text-orange-600">{job.revisionCount} Revisionen</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-[#E5E5E5] mx-auto mb-4" />
              <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16pt' }}>
                Keine Jobs gefunden
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
