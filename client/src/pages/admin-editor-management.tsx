import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import {
  ArrowLeft,
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
import { SEOHead } from '@shared/components';
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
import { 
  EDITORS, 
  getEditorStats, 
  autoAssignEditor,
  Editor,
  EditorStatus,
} from '@/utils/editor-assignment';
import { useToast } from '@/hooks/use-toast';

export default function AdminEditorManagement() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const [, setLocation] = useLocation();
  const [editors, setEditors] = useState<Editor[]>(EDITORS);
  const [statusFilter, setStatusFilter] = useState<'all' | EditorStatus>('all');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const { toast } = useToast();

  if (authLoading) return null;
  
  const stats = getEditorStats();
  
  const filteredEditors = editors.filter((editor) => {
    if (statusFilter === 'all') return true;
    return editor.status === statusFilter;
  });

  const getStatusBadge = (status: EditorStatus) => {
    const styles = {
      available: 'bg-[#64BF49]/10 text-[#64BF49] border-[#64BF49]/20',
      busy: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      offline: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
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
      <Badge variant="outline" className={styles[status]}>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead
        title="Editor Management – pix.immo Admin"
        description="Verwaltung und Zuweisung von Editoren"
        path="/admin-editor-management"
      />

      <header className="bg-gray-900 text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
              className="h-10 w-10 text-white hover:bg-white/10"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold mb-2">
                Editor Management
              </h1>
              <p className="text-gray-400">
                Team-Übersicht, Zuweisung und Performance-Tracking
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <div className="text-lg font-bold">{stats.availableEditors}</div>
                  <div className="text-gray-400 text-xs">Verfügbar</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {stats.totalCurrentJobs}/{stats.totalCapacity}
                  </div>
                  <div className="text-gray-400 text-xs">Workload</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {stats.capacityUtilization.toFixed(0)}%
                  </div>
                  <div className="text-gray-400 text-xs">Auslastung</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {stats.avgQualityScore.toFixed(0)}%
                  </div>
                  <div className="text-gray-400 text-xs">Avg. Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[200px] h-11" data-testid="filter-status">
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
            </div>

            <Button className="bg-green-600 text-white hover:bg-green-700" data-testid="button-add-editor">
              <UserPlus className="h-5 w-5 mr-2" />
              Editor hinzufügen
            </Button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 gap-4">
          {filteredEditors.map((editor) => (
            <div key={editor.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow" data-testid={`editor-card-${editor.id}`}>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-base font-bold">
                  {editor.name.split(' ').map((n) => n[0]).join('')}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">
                          {editor.name}
                        </h3>
                        {getStatusBadge(editor.status)}
                      </div>
                      <p className="text-gray-600 text-sm">{editor.email}</p>
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
                      <Badge key={spec} variant="outline" className="bg-gray-100 text-gray-700 border-transparent">
                        {spec}
                      </Badge>
                    ))}
                    {editor.preferredSources?.map((source) => (
                      <Badge
                        key={source}
                        variant="outline"
                        className={
                          source === 'app'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }
                      >
                        {source === 'app' ? '📱 App' : '📷 Pro'}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-5 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-xs">Workload</span>
                        <span className="text-gray-900 font-semibold text-sm">
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
                        <Award className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-xs">Qualität</span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {editor.qualityScore}%
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-xs">Avg. Zeit</span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {editor.avgTurnaroundHours}h
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-xs">Abgeschlossen</span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {editor.completedJobs}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-600 text-xs">Kapazität</span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {((editor.currentJobs / editor.maxJobs) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEditors.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">Keine Editoren gefunden</p>
          </div>
        )}
      </main>

      {showEditorDialog && selectedEditor && (
        <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedEditor.name}</DialogTitle>
              <DialogDescription>{selectedEditor.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Status</p>
                  {getStatusBadge(selectedEditor.status)}
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Aktuelle Jobs</p>
                  <p className="text-base font-bold">
                    {selectedEditor.currentJobs}/{selectedEditor.maxJobs}
                  </p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Qualitätsscore</p>
                  <p className="text-base font-bold">{selectedEditor.qualityScore}%</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <p className="text-gray-600 text-xs mb-1">Avg. Bearbeitungszeit</p>
                  <p className="text-base font-bold">{selectedEditor.avgTurnaroundHours}h</p>
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-2">Spezialisierungen</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEditor.specialization.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-600 text-xs mb-2">Bevorzugte Pipelines</p>
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
                <Button className="flex-1 bg-green-600 text-white hover:bg-green-700">
                  Job zuweisen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
