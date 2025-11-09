import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Upload, CheckCircle2, Hash, Copy, Check, Image as ImageIcon, Wifi, WifiOff, Smartphone, Camera } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { IPhoneFrame } from '../components/IPhoneFrame';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner@2.0.3';

interface PhotoStack {
  stackId: string;
  shots: any[];
  thumbnail: any;
  deviceType: 'pro' | 'standard';
  format: 'DNG' | 'JPG';
  timestamp: Date;
  room: string;
  selected: boolean;
}

interface Job {
  id: number;
  jobId: string;
  title: string;
  address: string;
  date: string;
  time: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  photos: number;
  rooms: number;
}

export default function AppUpload() {
  const [, setLocation] = useLocation();
  const [uploadStacks, setUploadStacks] = useState<PhotoStack[]>([]);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isWifi, setIsWifi] = useState(true);
  const [uploadSource, setUploadSource] = useState<'camera' | 'files' | null>(null);

  // Load selected stacks and current job
  useEffect(() => {
    const stored = localStorage.getItem('uploadStacks');
    if (stored) {
      const stacks = JSON.parse(stored).map((stack: any) => ({
        ...stack,
        timestamp: new Date(stack.timestamp)
      }));
      setUploadStacks(stacks);
    }

    // Load current/latest job from jobs list
    const savedJobs = localStorage.getItem('pix_recent_jobs');
    if (savedJobs) {
      try {
        const jobs = JSON.parse(savedJobs);
        if (jobs.length > 0) {
          setCurrentJob(jobs[0]); // Latest job
        }
      } catch (error) {
        console.error('Error loading job:', error);
      }
    }

    // Check WiFi status (mock)
    checkNetworkType();
  }, []);

  const checkNetworkType = () => {
    // In production: use navigator.connection API
    setIsWifi(true); // Mock: always WiFi
  };

  const handleCopyJobId = () => {
    if (currentJob?.jobId) {
      navigator.clipboard.writeText(currentJob.jobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStartUpload = async () => {
    if (uploadStacks.length === 0) {
      toast.error('Keine Fotos ausgewählt');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadComplete(true);
          
          // Update job status
          if (currentJob) {
            const savedJobs = localStorage.getItem('pix_recent_jobs');
            if (savedJobs) {
              const jobs = JSON.parse(savedJobs);
              const updatedJobs = jobs.map((job: Job) =>
                job.id === currentJob.id
                  ? { ...job, status: 'completed', photos: uploadStacks.reduce((sum, s) => sum + s.shots.length, 0) }
                  : job
              );
              localStorage.setItem('pix_recent_jobs', JSON.stringify(updatedJobs));
            }
          }

          toast.success('Upload erfolgreich abgeschlossen!');
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleBack = () => {
    setLocation('/pixcapture-app/gallery');
  };

  const handleDone = () => {
    // Clear upload data
    localStorage.removeItem('uploadStacks');
    setLocation('/pixcapture-app/jobs');
  };

  const totalPhotos = uploadStacks.reduce((sum, stack) => sum + stack.shots.length, 0);

  return (
    <IPhoneFrame>
      <div className="min-h-full bg-[#F9F9F7] dark:bg-[#0E0E0E] flex flex-col" style={{ paddingTop: '59px', paddingBottom: '34px' }}>
        {/* Header */}
        <header className="bg-white dark:bg-[#1A1A1C] border-b border-[#E5E5E5] dark:border-[#2C2C2C] sticky z-10" style={{ top: '59px' }}>
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10"
                disabled={uploading}
              >
                <ArrowLeft className="h-5 w-5 text-[#111111] dark:text-white" />
              </Button>
              <h1
                className="text-[#111111] dark:text-white"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '22pt',
                  lineHeight: '28pt',
                }}
              >
                Upload
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-6 py-6 overflow-y-auto">
          {!uploadComplete ? (
            <div className="space-y-6" style={{ paddingBottom: '40px' }}>
              {/* Job-ID Card */}
              {currentJob && (
                <div 
                  className="bg-white dark:bg-[#1A1A1C] p-5 border-2 border-[#64BF49]"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-4 w-4 text-[#64BF49]" />
                        <Label
                          className="text-[#6B7280] dark:text-[#A3A3A3]"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 600,
                            fontSize: '13pt',
                          }}
                        >
                          Job-ID
                        </Label>
                      </div>
                      <p
                        className="text-[#111111] dark:text-white font-mono break-all"
                        style={{
                          fontFamily: 'SF Mono, Monaco, monospace',
                          fontWeight: 600,
                          fontSize: '18pt',
                          letterSpacing: '-0.5px',
                        }}
                      >
                        {currentJob.jobId}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleCopyJobId}
                      className="h-10 w-10 shrink-0"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-[#64BF49]" />
                      ) : (
                        <Copy className="h-5 w-5 text-[#6B7280]" />
                      )}
                    </Button>
                  </div>

                  {currentJob.title && (
                    <p
                      className="text-[#111111] dark:text-white mb-2"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '16pt',
                      }}
                    >
                      {currentJob.title}
                    </p>
                  )}
                  <p
                    className="text-[#6B7280] dark:text-[#A3A3A3]"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '15pt',
                    }}
                  >
                    {currentJob.address}
                  </p>
                </div>
              )}

              {/* Upload Source Selection - NEW */}
              {uploadStacks.length === 0 && !uploadSource && (
                <div className="space-y-4">
                  <h2
                    className="text-[#111111] dark:text-white mb-4"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '17pt',
                    }}
                  >
                    Fotos hochladen von:
                  </h2>
                  
                  {/* iPhone/Camera Option */}
                  <button
                    onClick={() => {
                      setUploadSource('camera');
                      setLocation('/app-camera');
                    }}
                    className="w-full bg-white dark:bg-[#1A1A1C] p-6 border-2 border-[#E5E5E5] dark:border-[#2C2C2C] hover:border-[#74A4EA] transition-all"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#74A4EA]/10 rounded-full flex items-center justify-center shrink-0">
                        <Camera className="h-7 w-7 text-[#74A4EA]" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3
                          className="text-[#111111] dark:text-white mb-1"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 600,
                            fontSize: '16pt',
                          }}
                        >
                          iPhone Kamera
                        </h3>
                        <p
                          className="text-[#6B7280] dark:text-[#A3A3A3]"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '13pt',
                          }}
                        >
                          Direkt fotografieren mit Pro-Features
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20">
                        Empfohlen
                      </Badge>
                    </div>
                  </button>

                  {/* Android/File Upload Option */}
                  <button
                    onClick={() => {
                      setUploadSource('files');
                      toast.info('Dateien auswählen', {
                        description: 'Android File Picker öffnet sich...',
                      });
                      // TODO: Trigger Android file picker or file input
                    }}
                    className="w-full bg-white dark:bg-[#1A1A1C] p-6 border-2 border-[#E5E5E5] dark:border-[#2C2C2C] hover:border-[#64BF49] transition-all"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#64BF49]/10 rounded-full flex items-center justify-center shrink-0">
                        <Smartphone className="h-7 w-7 text-[#64BF49]" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3
                          className="text-[#111111] dark:text-white mb-1"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontWeight: 600,
                            fontSize: '16pt',
                          }}
                        >
                          Android / Dateien auswählen
                        </h3>
                        <p
                          className="text-[#6B7280] dark:text-[#A3A3A3]"
                          style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: '13pt',
                          }}
                        >
                          Fotos aus Galerie hochladen
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-[#64BF49]/10 text-[#64BF49] border-[#64BF49]/20">
                        Neu
                      </Badge>
                    </div>
                  </button>

                  <div className="bg-[#F0F0F0] dark:bg-[#2C2C2C] p-4 border border-[#E5E5E5] dark:border-[#3C3C3C]" style={{ borderRadius: '0px' }}>
                    <p
                      className="text-[#6B7280] dark:text-[#A3A3A3] text-center"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '13pt',
                      }}
                    >
                      💡 <strong>Tipp:</strong> Für beste Ergebnisse nutze die integrierte Kamera mit HDR und Wasserwaage
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Summary */}
              {uploadStacks.length > 0 && (
                <div 
                  className="bg-white dark:bg-[#1A1A1C] p-5 border border-[#E5E5E5] dark:border-[#2C2C2C]"
                  style={{ borderRadius: '0px' }}
                >
                  <h2
                    className="text-[#111111] dark:text-white mb-4"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontWeight: 600,
                      fontSize: '17pt',
                    }}
                  >
                    Upload-Übersicht
                  </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '15pt',
                      }}
                    >
                      Foto-Stacks
                    </span>
                    <span
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '15pt',
                      }}
                    >
                      {uploadStacks.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '15pt',
                      }}
                    >
                      Gesamt-Fotos
                    </span>
                    <span
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '15pt',
                      }}
                    >
                      {totalPhotos}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '15pt',
                      }}
                    >
                      Räume
                    </span>
                    <span
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '15pt',
                      }}
                    >
                      {new Set(uploadStacks.map((s) => s.room)).size}
                    </span>
                  </div>
                </div>
              </div>
              )}

              {/* Network Status */}
              {uploadStacks.length > 0 && (
              <div 
                className={`p-4 border flex items-center gap-3 ${
                  isWifi 
                    ? 'bg-[#F0FDF4] border-[#64BF49] dark:bg-[#1A2E1A]' 
                    : 'bg-[#FEF2F2] border-[#E11D48] dark:bg-[#2E1A1A]'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {isWifi ? (
                  <Wifi className="h-5 w-5 text-[#64BF49]" />
                ) : (
                  <WifiOff className="h-5 w-5 text-[#E11D48]" />
                )}
                <p
                  className={isWifi ? 'text-[#64BF49]' : 'text-[#E11D48]'}
                  style={{
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontSize: '14pt',
                    fontWeight: 600,
                  }}
                >
                  {isWifi ? 'WLAN verbunden' : 'Mobiles Netz'}
                </p>
              </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div 
                  className="bg-white dark:bg-[#1A1A1C] p-5 border border-[#E5E5E5] dark:border-[#2C2C2C]"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[#111111] dark:text-white"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '15pt',
                      }}
                    >
                      Uploading...
                    </span>
                    <span
                      className="text-[#64BF49]"
                      style={{
                        fontFamily: 'SF Mono, Monaco, monospace',
                        fontWeight: 600,
                        fontSize: '15pt',
                      }}
                    >
                      {uploadProgress}%
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="h-3" />
                </div>
              )}

              {/* Upload Button */}
              {!uploading && (
                <Button
                  onClick={handleStartUpload}
                  disabled={uploadStacks.length === 0}
                  className="w-full text-white hover:opacity-90"
                  style={{
                    height: '56pt',
                    borderRadius: '0px',
                    background: '#1A1A1C',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: '17pt',
                  }}
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload starten
                </Button>
              )}
            </div>
          ) : (
            /* Upload Complete */
            <div className="flex flex-col items-center justify-center py-12" style={{ paddingBottom: '40px' }}>
              <div className="w-20 h-20 bg-[#64BF49] flex items-center justify-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>

              <h2
                className="text-[#111111] dark:text-white mb-2"
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '24pt',
                }}
              >
                Upload abgeschlossen
              </h2>

              {currentJob && (
                <p
                  className="text-[#64BF49] font-mono mb-6"
                  style={{
                    fontFamily: 'SF Mono, Monaco, monospace',
                    fontWeight: 600,
                    fontSize: '16pt',
                  }}
                >
                  {currentJob.jobId}
                </p>
              )}

              <div className="w-full space-y-4 mb-8">
                <div 
                  className="bg-white dark:bg-[#1A1A1C] p-5 border border-[#E5E5E5] dark:border-[#2C2C2C]"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[#6B7280] dark:text-[#A3A3A3]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontSize: '15pt',
                      }}
                    >
                      Hochgeladene Fotos
                    </span>
                    <span
                      className="text-[#64BF49]"
                      style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        fontWeight: 600,
                        fontSize: '17pt',
                      }}
                    >
                      {totalPhotos}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F0FDF4] dark:bg-[#1A2E1A] p-4 border border-[#64BF49]" style={{ borderRadius: '0px' }}>
                  <p
                    className="text-[#64BF49]"
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '14pt',
                      lineHeight: '20pt',
                    }}
                  >
                    Ihre Fotos werden verarbeitet. Sie erhalten eine Benachrichtigung, sobald die Bearbeitung abgeschlossen ist.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleDone}
                className="w-full text-white hover:opacity-90"
                style={{
                  height: '56pt',
                  borderRadius: '0px',
                  background: '#1A1A1C',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: 600,
                  fontSize: '17pt',
                }}
              >
                Zu Jobs
              </Button>
            </div>
          )}
        </main>
      </div>
    </IPhoneFrame>
  );
}
