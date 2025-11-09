import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Plus, Search, Filter, LogOut, Camera, Building2, MapPin, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { AppNavigationBar } from '../components/AppNavigationBar';
import { IPhoneFrame } from '../components/IPhoneFrame';

interface Job {
  id: number;
  jobId?: string; // Format: 20251106-DF741
  title: string;
  address: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  photos: number;
  rooms: number;
}

export default function AppJobs() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);

  // Load jobs from localStorage on mount
  useEffect(() => {
    const savedJobs = localStorage.getItem('pix_recent_jobs');
    if (savedJobs) {
      try {
        const parsedJobs = JSON.parse(savedJobs);
        setJobs(parsedJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        setJobs(getDefaultJobs());
      }
    } else {
      setJobs(getDefaultJobs());
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (jobs.length > 0) {
      // Keep only last 4 jobs
      const recentJobs = jobs.slice(0, 4);
      localStorage.setItem('pix_recent_jobs', JSON.stringify(recentJobs));
    }
  }, [jobs]);

  const getDefaultJobs = (): Job[] => [
    {
      id: 1,
      title: 'Einfamilienhaus Eppendorf',
      address: 'Eppendorfer Landstraße 45, 20249 Hamburg',
      date: '2025-11-10',
      time: '14:00',
      status: 'scheduled',
      photos: 0,
      rooms: 8,
    },
    {
      id: 2,
      title: 'Penthouse Hafencity',
      address: 'Am Sandtorkai 12, 20457 Hamburg',
      date: '2025-11-08',
      time: '10:00',
      status: 'in-progress',
      photos: 24,
      rooms: 6,
    },
    {
      id: 3,
      title: 'Villa Blankenese',
      address: 'Elbchaussee 234, 22587 Hamburg',
      date: '2025-11-05',
      time: '15:00',
      status: 'completed',
      photos: 45,
      rooms: 12,
    },
  ];

  const handleLogout = () => {
    // Lösche Session Token
    localStorage.removeItem('pix_session_token');
    localStorage.removeItem('pix_token_expiry');
    
    // Zurück zum Login
    setLocation('/pixcapture-app/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-[#74A4EA] text-white">Geplant</Badge>;
      case 'in-progress':
        return <Badge className="bg-[#C9B55A] text-white">In Bearbeitung</Badge>;
      case 'completed':
        return <Badge className="bg-[#64BF49] text-white">Abgeschlossen</Badge>;
      default:
        return null;
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <IPhoneFrame>
      <div className="min-h-full bg-[#F9F9F7] dark:bg-[#0E0E0E] flex flex-col" style={{ position: 'relative', height: '100%', paddingTop: '59px', paddingBottom: '34px' }}>
      {/* Header */}
      <header className="bg-white dark:bg-[#1A1A1C] border-b border-[#E5E5E5] dark:border-[#2C2C2C] sticky z-10" style={{ top: '59px' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '22pt',
                  lineHeight: '28pt',
                }}
              >
                Jobs
              </h1>
              <p
                className="text-[#6B7280] dark:text-[#A3A3A3] mt-1"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '15pt',
                }}
              >
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Auftrag' : 'Aufträge'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-11 w-11"
            >
              <LogOut className="h-5 w-5 text-[#6B7280] dark:text-[#A3A3A3]" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A3A3A3]"
              size={20}
            />
            <Input
              type="search"
              placeholder="Jobs durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F9F9F7] dark:bg-[#0E0E0E] border-[#E5E5E5] dark:border-[#2C2C2C] pl-12"
              style={{
                height: '48pt',
                borderRadius: '0px',
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9"
            >
              <Filter className="h-4 w-4 text-[#6B7280] dark:text-[#A3A3A3]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Jobs List */}
      <main className="flex-1 px-6 py-6">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-[#8E9094] mx-auto mb-4" />
            <p className="text-[#6B7280] dark:text-[#A3A3A3]">
              {searchQuery ? 'Keine Jobs gefunden' : 'Noch keine Jobs vorhanden'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* New Job Card */}
            <Link href="/pixcapture-app/job-new">
              <div
                className="bg-white dark:bg-[#1A1A1C] p-8 border-2 border-dashed border-[#E5E5E5] dark:border-[#2C2C2C] active:bg-[#F9F9F7] dark:active:bg-[#2C2C2C] transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px]"
                style={{ borderRadius: '0px' }}
              >
                <div className="w-16 h-16 bg-[#1A1A1C] dark:bg-white flex items-center justify-center mb-3">
                  <Plus className="h-8 w-8 text-white dark:text-[#1A1A1C]" />
                </div>
                <p
                  className="text-[#111111] dark:text-white"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '17pt',
                  }}
                >
                  Neuer Job
                </p>
                <p
                  className="text-[#6B7280] dark:text-[#A3A3A3] mt-1"
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14pt',
                  }}
                >
                  Auftrag hinzufügen
                </p>
              </div>
            </Link>

            {/* Existing Jobs */}
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-[#1A1A1C] p-5 border border-[#E5E5E5] dark:border-[#2C2C2C] active:bg-[#F9F9F7] dark:active:bg-[#2C2C2C] transition-colors"
                style={{ borderRadius: '0px' }}
              >
                {/* Job-ID Badge (if available) */}
                {job.jobId && (
                  <div className="mb-3 pb-3 border-b border-[#E5E5E5] dark:border-[#2C2C2C]">
                    <p
                      className="text-[#64BF49] font-mono"
                      style={{
                        fontFamily: 'SF Mono, Monaco, monospace',
                        fontWeight: 600,
                        fontSize: '14pt',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {job.jobId}
                    </p>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3
                      className="text-[#111111] dark:text-white mb-1"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '17pt',
                        lineHeight: '22pt',
                      }}
                    >
                      {job.title || job.jobId || 'Unbenannter Job'}
                    </h3>
                    <p
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '15pt',
                        lineHeight: '20pt',
                      }}
                    >
                      {job.address}
                    </p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                {/* Datum/Zeit nur anzeigen wenn vorhanden (aus EXIF) */}
                {job.date && job.time && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-[#74A4EA]" />
                      <span 
                        className="text-[#6B7280] dark:text-[#A3A3A3]"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '14pt',
                        }}
                      >
                        {new Date(job.date).toLocaleDateString('de-DE')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-[#74A4EA]" />
                      <span 
                        className="text-[#6B7280] dark:text-[#A3A3A3]"
                        style={{
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: '14pt',
                        }}
                      >
                        {job.time} Uhr
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Camera size={18} className="text-[#64BF49]" />
                    <span 
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '14pt',
                      }}
                    >
                      {job.photos} Fotos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={18} className="text-[#64BF49]" />
                    <span 
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '14pt',
                      }}
                    >
                      {job.rooms} Räume
                    </span>
                  </div>
                </div>

                {job.status === 'scheduled' && (
                  <Button
                    className="w-full mt-4 text-white hover:opacity-90"
                    style={{
                      height: '52pt',
                      borderRadius: '0px',
                      background: '#1A1A1C',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '16pt',
                    }}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Shooting starten
                  </Button>
                )}

                {job.status === 'in-progress' && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[#74A4EA] text-[#74A4EA] hover:bg-[#74A4EA]/10"
                    style={{
                      height: '52pt',
                      borderRadius: '0px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '16pt',
                    }}
                  >
                    Fortsetzen
                  </Button>
                )}

                {job.status === 'completed' && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-[#64BF49] text-[#64BF49] hover:bg-[#64BF49]/10"
                    style={{
                      height: '52pt',
                      borderRadius: '0px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '16pt',
                    }}
                  >
                    Details ansehen
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

        {/* Navigation Bar */}
        <AppNavigationBar activeRoute="/pixcapture-app/jobs" />

        {/* FAB - New Job */}
        <Link href="/pixcapture-app/job-new">
          <button
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#1A1A1C] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            style={{ borderRadius: '0px' }}
            aria-label="Neuer Job"
          >
            <Plus className="h-7 w-7 text-white" />
          </button>
        </Link>
      </div>
    </IPhoneFrame>
  );
}
