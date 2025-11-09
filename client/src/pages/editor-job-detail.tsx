import { useLocation, useSearch } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  User,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@shared/components';

interface EnrichedAssignment {
  id: string;
  editorId: string;
  jobId: string;
  assignedAt: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  dueDate: string | null;
  notes: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  job: {
    id: string;
    jobNumber: string;
    customerName: string | null;
    propertyAddress: string;
    status: string;
    createdAt: string;
  };
  editor: {
    id: string;
    email: string;
    name: string | null;
  };
  imageCount: number;
}

export default function EditorJobDetail() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const jobNumber = searchParams.get('id');

  const { data: assignment, isLoading, error } = useQuery<EnrichedAssignment>({
    queryKey: ['/api/editor-assignments/by-job', jobNumber],
    queryFn: async () => {
      const res = await fetch(`/api/editor-assignments/by-job/${jobNumber}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 401) {
          setLocation('/login');
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch assignment');
      }
      return res.json();
    },
    enabled: !!jobNumber,
  });

  const getStatusBadge = (status: EnrichedAssignment['status']) => {
    const variants = {
      assigned: { variant: 'default' as const, label: 'Zugewiesen', className: 'bg-blue-500 text-white' },
      in_progress: { variant: 'default' as const, label: 'In Bearbeitung', className: 'bg-yellow-500 text-white' },
      completed: { variant: 'default' as const, label: 'Abgeschlossen', className: 'bg-green-500 text-white' },
      cancelled: { variant: 'destructive' as const, label: 'Abgebrochen', className: '' },
    };
    const { variant, label, className = '' } = variants[status];
    return (
      <Badge variant={variant} className={className} data-testid={`badge-status-${status}`}>
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: EnrichedAssignment['priority']) => {
    const variants = {
      low: { variant: 'outline' as const, label: 'Niedrig', className: '' },
      normal: { variant: 'default' as const, label: 'Normal', className: '' },
      high: { variant: 'default' as const, label: 'Hoch', className: 'bg-orange-500 text-white' },
      urgent: { variant: 'destructive' as const, label: 'Dringend', className: '' },
    };
    const { variant, label, className = '' } = variants[priority];
    return (
      <Badge variant={variant} className={className} data-testid={`badge-priority-${priority}`}>
        {label}
      </Badge>
    );
  };

  if (!jobNumber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Keine Job-ID angegeben</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead title="Editor – Job Details" description="Job Details laden..." path="/editor-job-detail" />
        <div className="max-w-[1400px] mx-auto w-full px-6 py-8">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead title="Editor – Job nicht gefunden" description="Job Details" path="/editor-job-detail" />
        <div className="max-w-[1400px] mx-auto w-full px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/editor-dashboard')}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Zurück zum Dashboard
          </Button>
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Job nicht gefunden oder kein Zugriff
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`Editor – ${assignment.job.jobNumber}`}
        description={`Job Details für ${assignment.job.customerName || 'Kunde'}`}
        path="/editor-job-detail"
      />

      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/editor-dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-foreground" data-testid="text-job-number">
                  {assignment.job.jobNumber}
                </h1>
                {getStatusBadge(assignment.status)}
                {getPriorityBadge(assignment.priority)}
              </div>
              <p className="text-muted-foreground">
                {assignment.job.customerName || 'Kein Kunde angegeben'} · {assignment.job.propertyAddress}
              </p>
            </div>
          </div>

          {/* Job Info Bar */}
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span data-testid="text-image-count">{assignment.imageCount} Bilder</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Zugewiesen: {new Date(assignment.assignedAt).toLocaleDateString('de-DE')}</span>
            </div>
            {assignment.dueDate && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span>
                  Deadline:{' '}
                  <span className="text-destructive font-semibold">
                    {new Date(assignment.dueDate).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{assignment.editor.name || assignment.editor.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Job Details</h2>
          <div className="space-y-3 text-muted-foreground">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Kunde</p>
                <p>{assignment.job.customerName || 'Nicht angegeben'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Adresse</p>
                <p>{assignment.job.propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Editor</p>
                <p>{assignment.editor.name || assignment.editor.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Anzahl Bilder</p>
                <p>{assignment.imageCount}</p>
              </div>
            </div>
            {assignment.notes && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Notizen</p>
                <p>{assignment.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-center text-muted-foreground">
          <p>Bildbearbeitung und Lieferung folgen in kommenden Updates</p>
        </div>
      </main>
    </div>
  );
}
