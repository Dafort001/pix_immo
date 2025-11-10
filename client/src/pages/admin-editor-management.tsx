import { useState } from 'react';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Settings,
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminPageHeader } from '@/components/AdminPageHeader';
import { getQueryFn } from '@/lib/queryClient';
import { 
  EDITORS, 
  getEditorStats, 
  autoAssignEditor,
  Editor,
  EditorStatus,
} from '@/utils/editor-assignment';
import { useToast } from '@/hooks/use-toast';

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

export default function AdminEditorManagement() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const [editors, setEditors] = useState<Editor[]>(EDITORS);
  const [statusFilter, setStatusFilter] = useState<'all' | EditorStatus>('all');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const { toast } = useToast();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  if (authLoading || userLoading) return null;
  if (!userData) return null;
  
  const stats = getEditorStats();
  
  const filteredEditors = editors.filter((editor) => {
    if (statusFilter === 'all') return true;
    return editor.status === statusFilter;
  });

  const getStatusBadge = (status: EditorStatus) => {
    const variants: Record<EditorStatus, 'default' | 'secondary' | 'destructive'> = {
      available: 'default',
      busy: 'secondary',
      offline: 'destructive',
    };

    const labels = {
      available: 'Verfügbar',
      busy: 'Ausgelastet',
      offline: 'Offline',
    };

    const icons = {
      available: <CheckCircle2 className="h-3 w-3 mr-1" />,
      busy: <AlertCircle className="h-3 w-3 mr-1" />,
      offline: <XCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <Badge variant={variants[status]}>
        {icons[status]}
        {labels[status]}
      </Badge>
    );
  };

  const handleViewEditor = (editor: Editor) => {
    setSelectedEditor(editor);
    setShowEditorDialog(true);
  };

  const handleAutoAssign = () => {
    const assigned = autoAssignEditor('20251106-TEST', 'app', 'normal', 24);
    if (assigned) {
      toast({
        title: "Erfolgreich zugewiesen",
        description: `Job automatisch zugewiesen an ${assigned.name}`,
      });
    } else {
      toast({
        title: "Fehler",
        description: "Keine verfügbaren Editoren gefunden",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = (editorId: string) => {
    setEditors((prev) =>
      prev.map((editor) => {
        if (editor.id === editorId) {
          const newStatus: EditorStatus =
            editor.status === 'available'
              ? 'offline'
              : editor.status === 'offline'
              ? 'available'
              : 'available';
          return { ...editor, status: newStatus };
        }
        return editor;
      })
    );
    toast({
      title: "Status aktualisiert",
      description: "Editor-Status wurde erfolgreich aktualisiert",
    });
  };

  return (
    <AdminLayout userRole={userData.user.role}>
      <div className="flex flex-col h-full">
        <AdminPageHeader 
          title="Editor Management" 
          showBackButton
          actions={
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[200px]" data-testid="filter-status">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="available">Verfügbar</SelectItem>
                  <SelectItem value="busy">Ausgelastet</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleAutoAssign} data-testid="button-auto-assign">
                Auto-Assign Test
              </Button>

              <Button data-testid="button-add-editor">
                <UserPlus className="h-5 w-5 mr-2" />
                Editor hinzufügen
              </Button>
            </div>
          }
        />

        {/* Stats Section */}
        <div className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <div className="grid grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{stats.availableEditors}</div>
                    <div className="text-xs text-muted-foreground">Verfügbar</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {stats.totalCurrentJobs}/{stats.totalCapacity}
                    </div>
                    <div className="text-xs text-muted-foreground">Workload</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {stats.capacityUtilization.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Auslastung</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {stats.avgQualityScore.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Avg. Quality</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 gap-4">
              {filteredEditors.map((editor) => (
                <Card key={editor.id} className="p-6 hover-elevate" data-testid={`editor-card-${editor.id}`}>
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-base font-bold">
                      {editor.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-base font-semibold">
                              {editor.name}
                            </h3>
                            {getStatusBadge(editor.status)}
                          </div>
                          <p className="text-muted-foreground text-sm">{editor.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewEditor(editor)}
                            data-testid={`button-view-${editor.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(editor.id)}
                            data-testid={`button-toggle-${editor.id}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {editor.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                        {editor.preferredSources?.map((source) => (
                          <Badge
                            key={source}
                            variant="outline"
                          >
                            {source === 'app' ? '📱 App' : '📷 Pro'}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-5 gap-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground text-xs">Workload</span>
                            <span className="font-semibold text-sm">
                              {editor.currentJobs}/{editor.maxJobs}
                            </span>
                          </div>
                          <Progress
                            value={(editor.currentJobs / editor.maxJobs) * 100}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">Qualität</span>
                          </div>
                          <div className="font-semibold">
                            {editor.qualityScore}%
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">Avg. Zeit</span>
                          </div>
                          <div className="font-semibold">
                            {editor.avgTurnaroundHours}h
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">Abgeschlossen</span>
                          </div>
                          <div className="font-semibold">
                            {editor.completedJobs}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground text-xs">Kapazität</span>
                          </div>
                          <div className="font-semibold">
                            {((editor.currentJobs / editor.maxJobs) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredEditors.length === 0 && (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Editoren gefunden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEditorDialog && selectedEditor && (
        <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedEditor.name}</DialogTitle>
              <DialogDescription>{selectedEditor.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-muted-foreground text-xs mb-1">Status</p>
                  {getStatusBadge(selectedEditor.status)}
                </Card>
                <Card className="p-4">
                  <p className="text-muted-foreground text-xs mb-1">Aktuelle Jobs</p>
                  <p className="text-base font-bold">
                    {selectedEditor.currentJobs}/{selectedEditor.maxJobs}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-muted-foreground text-xs mb-1">Qualitätsscore</p>
                  <p className="text-base font-bold">{selectedEditor.qualityScore}%</p>
                </Card>
                <Card className="p-4">
                  <p className="text-muted-foreground text-xs mb-1">Avg. Bearbeitungszeit</p>
                  <p className="text-base font-bold">{selectedEditor.avgTurnaroundHours}h</p>
                </Card>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-2">Spezialisierungen</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEditor.specialization.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs mb-2">Bevorzugte Pipelines</p>
                <div className="flex gap-2">
                  {selectedEditor.preferredSources?.map((source) => (
                    <Badge key={source} variant="outline">
                      {source === 'app' ? '📱 App-Upload' : '📷 Professional'}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button className="flex-1">
                  Job zuweisen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
