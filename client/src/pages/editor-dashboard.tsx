import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
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
  Smartphone,
  Camera,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@shared/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EditorAssignment, Job, Editor } from '@shared/schema';

type JobStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface EnrichedAssignment extends EditorAssignment {
  job: Job;
  editor: Editor;
  imageCount: number;
}

export default function EditorDashboard() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "editor" });
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');

  if (authLoading) return null;

  // Fetch assignments from API with server-side filtering
  const { data: assignments = [], isLoading, error } = useQuery<EnrichedAssignment[]>({
    queryKey: ['/api/editor-assignments', statusFilter, priorityFilter],
    queryFn: async ({ queryKey }) => {
      const [baseUrl, status, priority] = queryKey as [string, string, string];
      const params = new URLSearchParams();
      if (status && status !== 'all') params.append('status', status);
      if (priority && priority !== 'all') params.append('priority', priority);
      const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch assignments');
      return response.json();
    },
  });

  // Client-side search filtering only (status/priority filtered server-side) - null-safe
  const filteredAssignments = assignments.filter((assignment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (assignment.job.jobNumber && assignment.job.jobNumber.toLowerCase().includes(query)) ||
      (assignment.job.propertyName && assignment.job.propertyName.toLowerCase().includes(query)) ||
      (assignment.job.customerName && assignment.job.customerName.toLowerCase().includes(query)) ||
      (assignment.job.propertyAddress && assignment.job.propertyAddress.toLowerCase().includes(query));
    
    return matchesSearch;
  });

  // Calculate stats from filtered data
  const stats = {
    assigned: assignments.filter((a) => a.status === 'assigned').length,
    inProgress: assignments.filter((a) => a.status === 'in_progress').length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    cancelled: assignments.filter((a) => a.status === 'cancelled').length,
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      assigned: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      in_progress: 'bg-green-500/10 text-green-600 border-green-500/20',
      completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      cancelled: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    };

    const labels = {
      assigned: 'Zugewiesen',
      in_progress: 'In Bearbeitung',
      completed: 'Fertig',
      cancelled: 'Abgebrochen',
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]} data-testid={`badge-status-${status}`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'normal' || priority === 'low') return null;

    const styles = {
      high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      urgent: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    const labels = {
      high: 'Hohe Priorität',
      urgent: 'Dringend',
    };

    return (
      <Badge variant="outline" className={`${styles[priority as keyof typeof styles]} ml-2`}>
        {priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Editor Dashboard – pix.immo"
        description="Bearbeitungsübersicht für Immobilienfotos"
        path="/editor-dashboard"
      />

      {/* Header */}
      <header className="bg-card text-card-foreground border-b">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Editor Dashboard
              </h1>
              <p className="text-muted-foreground">
                Übersicht aller zu bearbeitenden Jobs
              </p>
            </div>
            <Button
              data-testid="button-batch-download"
              variant="default"
            >
              <Download className="h-5 w-5 mr-2" />
              Batch Download
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg" data-testid="stat-assigned">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-assigned-count">
                    {stats.assigned}
                  </div>
                  <div className="text-muted-foreground text-sm">Zugewiesen</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg" data-testid="stat-in-progress">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-in-progress-count">
                    {stats.inProgress}
                  </div>
                  <div className="text-muted-foreground text-sm">In Bearbeitung</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg" data-testid="stat-completed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-completed-count">
                    {stats.completed}
                  </div>
                  <div className="text-muted-foreground text-sm">Fertig</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg" data-testid="stat-cancelled">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold" data-testid="stat-cancelled-count">
                    {stats.cancelled}
                  </div>
                  <div className="text-muted-foreground text-sm">Abgebrochen</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Job-ID, Kunde oder Adresse suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
                data-testid="input-search-jobs"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[200px] h-11" data-testid="select-status-filter">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="assigned">Zugewiesen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Fertig</SelectItem>
                <SelectItem value="cancelled">Abgebrochen</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
              <SelectTrigger className="w-[200px] h-11" data-testid="select-priority-filter">
                <SelectValue placeholder="Priorität filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Prioritäten</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border rounded-lg p-6">
                <div className="flex items-start gap-6">
                  <Skeleton className="w-32 h-32 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-96" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Fehler beim Laden der Jobs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                onClick={() => setLocation(`/editor-job-detail?id=${assignment.job.jobNumber}`)}
                className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
                data-testid={`card-assignment-${assignment.id}`}
              >
                <div className="flex items-start gap-6">
                  {/* Thumbnail Placeholder */}
                  <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className="text-lg font-semibold text-foreground"
                            data-testid={`text-job-id-${assignment.id}`}
                          >
                            {assignment.job.jobNumber}
                          </h3>
                          {getStatusBadge(assignment.status)}
                          {getPriorityBadge(assignment.priority)}
                        </div>
                        <p className="text-muted-foreground mb-1">
                          {assignment.job.customerName || 'Kein Kunde angegeben'}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {assignment.job.propertyAddress}
                        </p>
                      </div>

                      <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-muted-foreground text-sm">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>{assignment.imageCount} Bilder</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Upload: {new Date(assignment.job.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      {assignment.job.deadlineAt && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Deadline:{' '}
                            <span className={assignment.priority === 'urgent' ? 'text-red-600 font-semibold' : ''}>
                              {new Date(assignment.job.deadlineAt).toLocaleDateString('de-DE', {
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
                        <span>{assignment.editor.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAssignments.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  Keine Jobs gefunden
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
