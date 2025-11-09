import { useState } from 'react';
import { useLocation } from 'wouter';
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
  Trash2,
  Eye,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { SEOHead } from '../components/SEOHead';
import { Footer } from '../components/Footer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { 
  EDITORS, 
  getEditorStats, 
  autoAssignEditor,
  Editor,
  EditorStatus,
} from '../utils/editor-assignment';
import { toast } from 'sonner@2.0.3';

export default function AdminEditorManagement() {
  const [, setLocation] = useLocation();
  const [editors, setEditors] = useState<Editor[]>(EDITORS);
  const [statusFilter, setStatusFilter] = useState<'all' | EditorStatus>('all');
  const [selectedEditor, setSelectedEditor] = useState<Editor | null>(null);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  
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

  const getWorkloadColor = (current: number, max: number) => {
    const ratio = current / max;
    if (ratio >= 0.9) return '#DC2626'; // Red
    if (ratio >= 0.7) return '#F59E0B'; // Orange
    return '#64BF49'; // Green
  };

  const handleViewEditor = (editor: Editor) => {
    setSelectedEditor(editor);
    setShowEditorDialog(true);
  };

  const handleAutoAssign = () => {
    const assigned = autoAssignEditor('20251106-TEST', 'app', 'normal', 24);
    if (assigned) {
      toast.success(`Job automatisch zugewiesen an ${assigned.name}`);
    } else {
      toast.error('Keine verfügbaren Editoren gefunden');
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
    toast.success('Editor-Status aktualisiert');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <SEOHead
        title="Editor Management – pix.immo Admin"
        description="Verwaltung und Zuweisung von Editoren"
        path="/admin-editor-management"
      />

      {/* Header */}
      <header className="bg-[#1A1A1C] text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/admin-dashboard')}
              className="h-10 w-10 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1
                className="text-[32pt] mb-2"
                style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}
              >
                Editor Management
              </h1>
              <p className="text-[#A3A3A3]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14pt' }}>
                Team-Übersicht, Zuweisung und Performance-Tracking
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#64BF49]/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#64BF49]" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.availableEditors}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Verfügbar</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#74A4EA]/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-[#74A4EA]" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.totalCurrentJobs}/{stats.totalCapacity}
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Workload</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.capacityUtilization.toFixed(0)}%
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Auslastung</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <div className="text-[24pt]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>
                    {stats.avgQualityScore.toFixed(0)}%
                  </div>
                  <div className="text-[#A3A3A3] text-[12pt]">Avg. Quality</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-[#E5E5E5] sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[200px] h-11">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="available">Verfügbar</SelectItem>
                  <SelectItem value="busy">Ausgelastet</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleAutoAssign}>
                Auto-Assign Test
              </Button>
            </div>

            <Button className="bg-[#64BF49] text-white hover:opacity-90" style={{ borderRadius: '0px' }}>
              <UserPlus className="h-5 w-5 mr-2" />
              Editor hinzufügen
            </Button>
          </div>
        </div>
      </div>

      {/* Editors List */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 gap-4">
          {filteredEditors.map((editor) => (
            <div key={editor.id} className="bg-white border border-[#E5E5E5] rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#64BF49] to-[#74A4EA] flex items-center justify-center text-white text-[20pt] font-bold">
                  {editor.name.split(' ').map((n) => n[0]).join('')}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className="text-[#111111]"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '18pt' }}
                        >
                          {editor.name}
                        </h3>
                        {getStatusBadge(editor.status)}
                      </div>
                      <p className="text-[#6B7280]" style={{ fontSize: '13pt' }}>
                        {editor.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewEditor(editor)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleStatus(editor.id)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editor.specialization.map((spec) => (
                      <Badge key={spec} variant="outline" className="bg-[#F0F0F0] text-[#6B7280] border-transparent">
                        {spec}
                      </Badge>
                    ))}
                    {editor.preferredSources?.map((source) => (
                      <Badge
                        key={source}
                        variant="outline"
                        className={
                          source === 'app'
                            ? 'bg-[#74A4EA]/10 text-[#74A4EA] border-[#74A4EA]/20'
                            : 'bg-[#1A1A1C]/10 text-[#1A1A1C] border-[#1A1A1C]/20'
                        }
                      >
                        {source === 'app' ? '📱 App' : '📷 Pro'}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-5 gap-6">
                    {/* Workload */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#6B7280] text-[12pt]">Workload</span>
                        <span
                          className="text-[#111111]"
                          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '13pt' }}
                        >
                          {editor.currentJobs}/{editor.maxJobs}
                        </span>
                      </div>
                      <Progress
                        value={(editor.currentJobs / editor.maxJobs) * 100}
                        className="h-2"
                        style={{
                          backgroundColor: '#E5E5E5',
                        }}
                      />
                    </div>

                    {/* Quality Score */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-[#6B7280] text-[12pt]">Qualität</span>
                      </div>
                      <div
                        className="text-[#111111]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}
                      >
                        {editor.qualityScore}%
                      </div>
                    </div>

                    {/* Turnaround */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-[#6B7280] text-[12pt]">Avg. Zeit</span>
                      </div>
                      <div
                        className="text-[#111111]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}
                      >
                        {editor.avgTurnaroundHours}h
                      </div>
                    </div>

                    {/* Completed Jobs */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-[#6B7280] text-[12pt]">Abgeschlossen</span>
                      </div>
                      <div
                        className="text-[#111111]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}
                      >
                        {editor.completedJobs}
                      </div>
                    </div>

                    {/* Capacity */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-[#6B7280]" />
                        <span className="text-[#6B7280] text-[12pt]">Kapazität</span>
                      </div>
                      <div
                        className="text-[#111111]"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, fontSize: '16pt' }}
                      >
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
            <Users className="h-16 w-16 text-[#E5E5E5] mx-auto mb-4" />
            <p className="text-[#6B7280]" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '16pt' }}>
              Keine Editoren gefunden
            </p>
          </div>
        )}
      </main>

      {/* Editor Detail Dialog */}
      {showEditorDialog && selectedEditor && (
        <Dialog open={showEditorDialog} onOpenChange={setShowEditorDialog}>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedEditor.name}</DialogTitle>
              <DialogDescription>{selectedEditor.email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F0F0F0] rounded-lg">
                  <p className="text-[#6B7280] text-[12pt] mb-1">Status</p>
                  {getStatusBadge(selectedEditor.status)}
                </div>
                <div className="p-4 bg-[#F0F0F0] rounded-lg">
                  <p className="text-[#6B7280] text-[12pt] mb-1">Aktuelle Jobs</p>
                  <p className="text-[20pt] font-bold">
                    {selectedEditor.currentJobs}/{selectedEditor.maxJobs}
                  </p>
                </div>
                <div className="p-4 bg-[#F0F0F0] rounded-lg">
                  <p className="text-[#6B7280] text-[12pt] mb-1">Qualitätsscore</p>
                  <p className="text-[20pt] font-bold">{selectedEditor.qualityScore}%</p>
                </div>
                <div className="p-4 bg-[#F0F0F0] rounded-lg">
                  <p className="text-[#6B7280] text-[12pt] mb-1">Avg. Bearbeitungszeit</p>
                  <p className="text-[20pt] font-bold">{selectedEditor.avgTurnaroundHours}h</p>
                </div>
              </div>

              <div>
                <p className="text-[#6B7280] text-[12pt] mb-2">Spezialisierungen</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEditor.specialization.map((spec) => (
                    <Badge key={spec} variant="outline">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#6B7280] text-[12pt] mb-2">Bevorzugte Pipelines</p>
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
                <Button className="flex-1 bg-[#64BF49] text-white hover:opacity-90">
                  Job zuweisen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
