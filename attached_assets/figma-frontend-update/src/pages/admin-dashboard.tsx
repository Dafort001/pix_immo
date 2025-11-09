import { useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  X,
  Calendar,
  User,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  ChevronRight,
  Settings,
  LogOut,
  FileText,
  Users,
  CreditCard,
  Server,
  Eye,
  UserPlus,
  Send,
  CheckCheck,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  FileCode,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Avatar } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { AppQuickAccessBanner } from '../components/AppQuickAccessBanner';

type OrderStatus =
  | 'neu'
  | 'geplant'
  | 'hochgeladen'
  | 'qc-faellig'
  | 'zurueck-an-editing'
  | 'beim-editor'
  | 'editor-fertig'
  | 'kundenfreigabe'
  | 'geliefert';

interface Order {
  id: string;
  shootCode: string;
  customer: string;
  isNewCustomer: boolean;
  address: string;
  addressVerified: boolean;
  appointment: string;
  package: string;
  addons: string[];
  status: OrderStatus;
  deadline: string;
  editor: string | null;
  commentsCount: number;
  lastAction: string;
  isOverdue: boolean;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  neu: {
    label: 'Neu',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    borderColor: '#D0D5DD',
  },
  geplant: {
    label: 'Geplant',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  hochgeladen: {
    label: 'Hochgeladen',
    color: '#4F46E5',
    bgColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  'qc-faellig': {
    label: 'QC fällig',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  'zurueck-an-editing': {
    label: 'Zurück an Editing',
    color: '#FB923C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  'beim-editor': {
    label: 'Beim Editor',
    color: '#64748B',
    bgColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  'editor-fertig': {
    label: 'Editor fertig',
    color: '#14B8A6',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
  kundenfreigabe: {
    label: 'Kundenfreigabe',
    color: '#7C3AED',
    bgColor: '#FAF5FF',
    borderColor: '#DDD6FE',
  },
  geliefert: {
    label: 'Geliefert',
    color: '#22C55E',
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
};

const mockOrders: Order[] = [
  {
    id: 'A-2025-1103-015',
    shootCode: 'AB12C',
    customer: 'Engel & Völkers Hamburg',
    isNewCustomer: false,
    address: 'Elbchaussee 123, 22763 Hamburg',
    addressVerified: true,
    appointment: '04.11.2025 14:00',
    package: '15 Bilder',
    addons: ['Drohne', '360°'],
    status: 'hochgeladen',
    deadline: '06.11.2025 18:00',
    editor: null,
    commentsCount: 3,
    lastAction: 'vor 2 Stunden',
    isOverdue: false,
  },
  {
    id: 'A-2025-1103-014',
    shootCode: 'CD34E',
    customer: 'Von Poll Immobilien',
    isNewCustomer: false,
    address: 'Alsterterrasse 1, 20354 Hamburg',
    addressVerified: true,
    appointment: '03.11.2025 15:30',
    package: '20 Bilder',
    addons: ['Video'],
    status: 'qc-faellig',
    deadline: '05.11.2025 12:00',
    editor: null,
    commentsCount: 1,
    lastAction: 'vor 4 Stunden',
    isOverdue: false,
  },
  {
    id: 'A-2025-1103-013',
    shootCode: 'EF56G',
    customer: 'OTTO Immobilien',
    isNewCustomer: true,
    address: 'Jungfernstieg 45, 20354 Hamburg',
    addressVerified: false,
    appointment: '05.11.2025 10:00',
    package: '10 Bilder',
    addons: [],
    status: 'geplant',
    deadline: '07.11.2025 18:00',
    editor: null,
    commentsCount: 0,
    lastAction: 'vor 1 Tag',
    isOverdue: false,
  },
  {
    id: 'A-2025-1102-012',
    shootCode: 'GH78I',
    customer: 'Engel & Völkers Hamburg',
    isNewCustomer: false,
    address: 'Rothenbaumchaussee 78, 20148 Hamburg',
    addressVerified: true,
    appointment: '02.11.2025 11:00',
    package: '15 Bilder',
    addons: ['Drohne'],
    status: 'beim-editor',
    deadline: '04.11.2025 18:00',
    editor: 'Sarah Weber',
    commentsCount: 2,
    lastAction: 'vor 6 Stunden',
    isOverdue: true,
  },
  {
    id: 'A-2025-1102-011',
    shootCode: 'IJ90K',
    customer: 'DAHLER & COMPANY',
    isNewCustomer: false,
    address: 'Isestraße 144, 20149 Hamburg',
    addressVerified: true,
    appointment: '01.11.2025 14:30',
    package: '20 Bilder',
    addons: ['360°', 'Video'],
    status: 'kundenfreigabe',
    deadline: '03.11.2025 18:00',
    editor: 'Max Müller',
    commentsCount: 5,
    lastAction: 'vor 1 Tag',
    isOverdue: true,
  },
  {
    id: 'A-2025-1101-010',
    shootCode: 'KL12M',
    customer: 'Budge Immobilien',
    isNewCustomer: false,
    address: 'Mittelweg 110, 20149 Hamburg',
    addressVerified: true,
    appointment: '31.10.2025 09:30',
    package: '15 Bilder',
    addons: [],
    status: 'geliefert',
    deadline: '02.11.2025 18:00',
    editor: 'Anna Schmidt',
    commentsCount: 1,
    lastAction: 'vor 2 Tagen',
    isOverdue: false,
  },
  {
    id: 'A-2025-1101-009',
    shootCode: 'MN34O',
    customer: 'Grossmann & Berger',
    isNewCustomer: true,
    address: 'Harvestehuder Weg 12, 20148 Hamburg',
    addressVerified: true,
    appointment: '06.11.2025 13:00',
    package: '10 Bilder',
    addons: [],
    status: 'neu',
    deadline: '08.11.2025 18:00',
    editor: null,
    commentsCount: 0,
    lastAction: 'vor 3 Stunden',
    isOverdue: false,
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('auftraege');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignEditor, setShowAssignEditor] = useState(false);
  const [showBackToEditing, setShowBackToEditing] = useState(false);
  const [showCustomerApproval, setShowCustomerApproval] = useState(false);

  // KPIs
  const openJobs = mockOrders.filter((o) => o.status !== 'geliefert').length;
  const todayDue = mockOrders.filter((o) => o.deadline.includes('03.11.2025')).length;
  const waitingQC = mockOrders.filter((o) => o.status === 'qc-faellig').length;
  const inEditing = mockOrders.filter((o) => o.status === 'beim-editor').length;
  const overdue = mockOrders.filter((o) => o.isOverdue).length;

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === mockOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(mockOrders.map((o) => o.id));
    }
  };

  return (
    <>
      <AppQuickAccessBanner />
      <div className="min-h-screen bg-[#FAFAFA] pt-20">
        {/* Global Header */}
        <header className="bg-white border-b border-[#E5E5E5] sticky top-20 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-[#1A1A1C] cursor-pointer">PIX.IMMO</span>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/dev-notes-qc">
                <Button variant="ghost" size="sm">
                  <FileCode className="h-4 w-4 mr-2" />
                  Dev Notes
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </Link>
            </div>
          </div>

          {/* KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <button className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#8E9094] transition-colors text-left">
              <div className="text-2xl mb-1" style={{ fontWeight: '700' }}>
                {openJobs}
              </div>
              <div className="text-sm text-[#8E9094]">Open Jobs</div>
            </button>

            <button className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#8E9094] transition-colors text-left">
              <div className="text-2xl mb-1" style={{ fontWeight: '700' }}>
                {todayDue}
              </div>
              <div className="text-sm text-[#8E9094]">Heute fällig</div>
            </button>

            <button className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#8E9094] transition-colors text-left">
              <div className="text-2xl mb-1" style={{ fontWeight: '700' }}>
                {waitingQC}
              </div>
              <div className="text-sm text-[#8E9094]">Wartet auf QC</div>
            </button>

            <button className="bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#8E9094] transition-colors text-left">
              <div className="text-2xl mb-1" style={{ fontWeight: '700' }}>
                {inEditing}
              </div>
              <div className="text-sm text-[#8E9094]">In Bearbeitung</div>
            </button>

            <button className="bg-white border-2 border-[#C94B38] rounded-lg p-4 hover:bg-[#FFF5F5] transition-colors text-left">
              <div className="text-2xl text-[#C94B38] mb-1" style={{ fontWeight: '700' }}>
                {overdue}
              </div>
              <div className="text-sm text-[#C94B38]">Überfällig</div>
            </button>
          </div>

          {/* Global Controls */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E9094]" />
              <Input
                type="text"
                placeholder="Auftrags-ID, Kunde, Adresse, Shoot-Code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-lg border-[#E5E5E5]"
              />
            </div>

            <select className="h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm">
              <option>Alle Zeiträume</option>
              <option>Heute</option>
              <option>7 Tage</option>
              <option>30 Tage</option>
            </select>

            <select className="h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm">
              <option>Alle Status</option>
              <option>Neu</option>
              <option>QC fällig</option>
              <option>Beim Editor</option>
              <option>Geliefert</option>
            </select>

            <select className="h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white text-sm">
              <option>Alle Kunden</option>
              <option>Engel & Völkers Hamburg</option>
              <option>Von Poll Immobilien</option>
              <option>OTTO Immobilien</option>
            </select>

            <Button variant="outline" size="sm" className="h-10">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6">
          <TabsList className="bg-transparent border-b border-[#E5E5E5] w-full justify-start rounded-none h-auto p-0">
            <TabsTrigger
              value="auftraege"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <FileText className="w-4 h-4 mr-2" />
              Aufträge
            </TabsTrigger>
            <TabsTrigger
              value="qc"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              QC
            </TabsTrigger>
            <TabsTrigger
              value="editor-return"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Editor Return
            </TabsTrigger>
            <TabsTrigger
              value="kunden"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Kunden
            </TabsTrigger>
            <TabsTrigger
              value="rechnungen"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Rechnungen
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#C2352D] data-[state=active]:bg-transparent px-4 py-3"
            >
              <Server className="w-4 h-4 mr-2" />
              System
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Main Area */}
        <div className={selectedOrder ? 'flex-1 p-6' : 'flex-1 p-6 max-w-full'}>
          <Tabs value={activeTab}>
            {/* Aufträge Tab */}
            <TabsContent value="auftraege" className="mt-0">
              {/* Batch Actions */}
              {selectedOrders.length > 0 && (
                <div className="bg-white border border-[#E5E5E5] rounded-lg p-4 mb-4 flex items-center justify-between shadow-sm">
                  <span className="text-sm text-[#1A1A1C]">{selectedOrders.length} ausgewählt</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAssignEditor(true)}
                      className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg h-9 px-4"
                    >
                      Editor zuweisen
                    </Button>
                    <Button variant="outline" className="rounded-lg h-9 px-4">
                      QC starten
                    </Button>
                    <Button variant="outline" className="rounded-lg h-9 px-4">
                      <Download className="w-4 h-4 mr-2" />
                      Exportieren
                    </Button>
                  </div>
                </div>
              )}

              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#FAFAFA] border-b border-[#E5E5E5]">
                      <tr>
                        <th className="px-4 py-3 text-left w-12">
                          <Checkbox
                            checked={
                              selectedOrders.length === mockOrders.length && mockOrders.length > 0
                            }
                            onCheckedChange={toggleAllOrders}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Auftrags-ID</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Shoot-Code</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Kunde</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Adresse</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Termin</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Paket</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Status</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Deadline</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Editor:in</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Kommentare</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094]">Letzte Aktion</th>
                        <th className="px-4 py-3 text-left text-sm text-[#8E9094] w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#1A1A1C] font-mono">{order.id}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-[#1A1A1C] font-mono">
                              {order.shootCode}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1A1A1C]">{order.customer}</span>
                              {order.isNewCustomer && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    color: '#74A4EA',
                                    borderColor: '#74A4EA',
                                    backgroundColor: '#F0F7FF',
                                  }}
                                >
                                  Neukunde
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#8E9094] max-w-[200px] truncate">
                                {order.address}
                              </span>
                              {order.addressVerified ? (
                                <CheckCircle2 className="w-4 h-4 text-[#64BF49] flex-shrink-0" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-[#C9B55A] flex-shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-[#8E9094]">{order.appointment}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-[#1A1A1C]">{order.package}</div>
                            {order.addons.length > 0 && (
                              <div className="text-xs text-[#8E9094]">
                                + {order.addons.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs whitespace-nowrap"
                                style={{
                                  color: statusConfig[order.status].color,
                                  backgroundColor: statusConfig[order.status].bgColor,
                                  borderColor: statusConfig[order.status].borderColor,
                                }}
                              >
                                {statusConfig[order.status].label}
                              </Badge>
                              {order.isOverdue && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    color: '#C94B38',
                                    backgroundColor: '#FFF5F5',
                                    borderColor: '#FFC4C4',
                                  }}
                                >
                                  Überfällig
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 text-sm ${
                              order.isOverdue ? 'text-[#C94B38]' : 'text-[#8E9094]'
                            }`}
                          >
                            {order.deadline}
                          </td>
                          <td className="px-4 py-3">
                            {order.editor ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6 bg-[#E5E5E5] text-xs">
                                  {order.editor.charAt(0)}
                                </Avatar>
                                <span className="text-sm text-[#1A1A1C]">{order.editor}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-[#8E9094]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {order.commentsCount > 0 ? (
                              <div className="flex items-center gap-1 text-sm text-[#8E9094]">
                                <MessageSquare className="w-4 h-4" />
                                {order.commentsCount}
                              </div>
                            ) : (
                              <span className="text-sm text-[#8E9094]">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#8E9094]">{order.lastAction}</td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 hover:bg-[#F0F0F0] rounded">
                              <MoreVertical className="w-4 h-4 text-[#8E9094]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* QC Tab */}
            <TabsContent value="qc" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#8E9094] mx-auto mb-4" />
                <h3 className="text-[#1A1A1C] mb-2">Keine Uploads warten auf Prüfung</h3>
                <p className="text-sm text-[#8E9094]">
                  Sobald neue Uploads eingehen, werden sie hier angezeigt.
                </p>
              </div>
            </TabsContent>

            {/* Editor Return Tab */}
            <TabsContent value="editor-return" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
                <ArrowLeft className="w-12 h-12 text-[#8E9094] mx-auto mb-4" />
                <h3 className="text-[#1A1A1C] mb-2">Keine Rückgaben eingegangen</h3>
                <p className="text-sm text-[#8E9094]">
                  Fertige Bearbeitungen von Editor:innen erscheinen hier.
                </p>
              </div>
            </TabsContent>

            {/* Kunden Tab */}
            <TabsContent value="kunden" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
                <Users className="w-12 h-12 text-[#8E9094] mx-auto mb-4" />
                <h3 className="text-[#1A1A1C] mb-2">Kundenverwaltung</h3>
                <p className="text-sm text-[#8E9094] mb-4">
                  Hier können Sie Kundendaten, Projekte und Standard-Setzungen verwalten.
                </p>
                <Button className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Neuer Kunde
                </Button>
              </div>
            </TabsContent>

            {/* Rechnungen Tab */}
            <TabsContent value="rechnungen" className="mt-0">
              <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-12 text-center">
                <CreditCard className="w-12 h-12 text-[#8E9094] mx-auto mb-4" />
                <h3 className="text-[#1A1A1C] mb-2">Rechnungsverwaltung</h3>
                <p className="text-sm text-[#8E9094]">
                  Status, Export DATEV, Kilometerpauschale (0,60 €/km)
                </p>
              </div>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Integrationen */}
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
                  <h3 className="text-[#1A1A1C] mb-4">Integrationen</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E9094]">Amazon SES (OTP)</span>
                      <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E9094]">Stripe</span>
                      <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E9094]">Google Places/Maps</span>
                      <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E9094]">Cloudflare R2</span>
                      <CheckCircle2 className="w-4 h-4 text-[#64BF49]" />
                    </div>
                  </div>
                </div>

                {/* Workflows */}
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
                  <h3 className="text-[#1A1A1C] mb-4">Workflows</h3>
                  <div className="space-y-3 text-sm">
                    <div className="text-[#8E9094]">CogVLM/GPT-Vision Captioning</div>
                    <div className="text-[#8E9094]">Downscale (3000px sRGB Q85)</div>
                    <div className="text-[#8E9094]">Quiet Window (60min)</div>
                  </div>
                </div>

                {/* Admin-Seiten */}
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
                  <h3 className="text-[#1A1A1C] mb-4">Admin-Bereiche</h3>
                  <div className="space-y-2">
                    <Link href="/eingegangene-uploads">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Eingegangene Uploads
                      </Button>
                    </Link>
                    <Link href="/upload-editing-team">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Upload → Editing Team
                      </Button>
                    </Link>
                    <Link href="/galerie">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Kunden-Galerie
                      </Button>
                    </Link>
                    <Link href="/admin-editorial">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Editorial Content
                      </Button>
                    </Link>
                    <Link href="/admin-seo">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        SEO Management
                      </Button>
                    </Link>
                    <Link href="/ai-lab">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        AI Lab
                      </Button>
                    </Link>
                    <Link href="/gallery-classify">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Gallery Classify
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Demo & Tools */}
                <div className="bg-white rounded-lg shadow-sm border border-[#E5E5E5] p-6">
                  <h3 className="text-[#1A1A1C] mb-4">Demo & Tools</h3>
                  <div className="space-y-2">
                    <Link href="/demo-jobs">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Demo Jobs
                      </Button>
                    </Link>
                    <Link href="/demo-upload">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Demo Upload
                      </Button>
                    </Link>
                    <Link href="/downloads">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Downloads
                      </Button>
                    </Link>
                    <Link href="/docs-rooms-spec">
                      <Button variant="outline" className="w-full justify-start text-sm h-9">
                        Rooms Spec (Docs)
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Detail Drawer */}
        {selectedOrder && (
          <div
            className="bg-white border-l border-[#E5E5E5] overflow-y-auto"
            style={{ width: '480px', maxHeight: 'calc(100vh - 60px)' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[#1A1A1C]">{selectedOrder.id}</span>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{
                        color: statusConfig[selectedOrder.status].color,
                        backgroundColor: statusConfig[selectedOrder.status].bgColor,
                        borderColor: statusConfig[selectedOrder.status].borderColor,
                      }}
                    >
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                    {selectedOrder.isOverdue && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: '#C94B38',
                          backgroundColor: '#FFF5F5',
                          borderColor: '#FFC4C4',
                        }}
                      >
                        Überfällig
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-[#8E9094]">Shoot-Code: {selectedOrder.shootCode}</div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-[#FAFAFA] rounded"
                >
                  <X className="w-5 h-5 text-[#8E9094]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Kunde */}
              <div>
                <h4 className="text-sm text-[#8E9094] mb-3">Kunde</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#8E9094]" />
                    <span className="text-sm text-[#1A1A1C]">{selectedOrder.customer}</span>
                    {selectedOrder.isNewCustomer && (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          color: '#74A4EA',
                          borderColor: '#74A4EA',
                          backgroundColor: '#F0F7FF',
                        }}
                      >
                        Neukunde
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8E9094]">
                    <Mail className="w-4 h-4" />
                    kontakt@engel-voelkers.de
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#8E9094]">
                    <Phone className="w-4 h-4" />
                    +49 40 123456
                  </div>
                  <Button variant="link" className="text-[#C2352D] p-0 h-auto text-sm">
                    In Kundenakte öffnen →
                  </Button>
                </div>
              </div>

              {/* Objekt */}
              <div>
                <h4 className="text-sm text-[#8E9094] mb-3">Objekt</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#8E9094] mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-[#1A1A1C] mb-1">{selectedOrder.address}</div>
                      {selectedOrder.addressVerified && (
                        <div className="flex items-center gap-1 text-xs text-[#64BF49]">
                          <CheckCircle2 className="w-3 h-3" />
                          Adresse verifiziert
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-[#F0F0F0] rounded-lg h-32 flex items-center justify-center text-sm text-[#8E9094]">
                    Kartenvorschau
                  </div>
                </div>
              </div>

              {/* Buchung */}
              <div>
                <h4 className="text-sm text-[#8E9094] mb-3">Buchung</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#8E9094]">Paket</span>
                    <span className="text-[#1A1A1C]">{selectedOrder.package}</span>
                  </div>
                  {selectedOrder.addons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#8E9094]">Add-ons</span>
                      <span className="text-[#1A1A1C]">{selectedOrder.addons.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#8E9094]">Termin</span>
                    <span className="text-[#1A1A1C]">{selectedOrder.appointment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E9094]">Deadline</span>
                    <span
                      className={selectedOrder.isOverdue ? 'text-[#C94B38]' : 'text-[#1A1A1C]'}
                    >
                      {selectedOrder.deadline}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div>
                <h4 className="text-sm text-[#8E9094] mb-3">Editor:in</h4>
                {selectedOrder.editor ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8 bg-[#E5E5E5]">{selectedOrder.editor.charAt(0)}</Avatar>
                    <span className="text-sm text-[#1A1A1C]">{selectedOrder.editor}</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#8E9094]">Noch nicht zugewiesen</div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm text-[#8E9094] mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#64BF49] mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-[#1A1A1C]">Auftrag erstellt</div>
                      <div className="text-xs text-[#8E9094]">03.11.2025 10:30</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#74A4EA] mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-[#1A1A1C]">Termin geplant</div>
                      <div className="text-xs text-[#8E9094]">03.11.2025 11:00</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C9B55A] mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-[#1A1A1C]">Bilder hochgeladen</div>
                      <div className="text-xs text-[#8E9094]">{selectedOrder.lastAction}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-[#E5E5E5] space-y-2 sticky bottom-0 bg-white">
              <Button
                onClick={() => setShowAssignEditor(true)}
                className="w-full bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg h-10"
              >
                Editor zuweisen
              </Button>
              <Button
                onClick={() => setShowBackToEditing(true)}
                variant="outline"
                className="w-full rounded-lg h-10"
              >
                Zurück an Editing
              </Button>
              <Button
                onClick={() => setShowCustomerApproval(true)}
                variant="outline"
                className="w-full rounded-lg h-10"
              >
                <Send className="w-4 h-4 mr-2" />
                Freigabe an Kunde senden
              </Button>
              <Button variant="outline" className="w-full rounded-lg h-10 text-[#64BF49]">
                <CheckCheck className="w-4 h-4 mr-2" />
                Als geliefert markieren
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Editor zuweisen Modal */}
      {showAssignEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-[#1A1A1C] mb-4">Editor:in zuweisen</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">Editor:in</label>
                <select className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white">
                  <option>Sarah Weber</option>
                  <option>Max Müller</option>
                  <option>Anna Schmidt</option>
                  <option>Tom Becker</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">Deadline</label>
                <Input type="datetime-local" className="rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">Notiz (optional)</label>
                <Textarea className="rounded-lg" placeholder="Besondere Hinweise..." rows={3} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAssignEditor(false)}
                className="rounded-lg"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => setShowAssignEditor(false)}
                className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg"
              >
                Zuweisen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Zurück an Editing Modal */}
      {showBackToEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-[#1A1A1C] mb-4">Zurück an Editing geben</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">
                  Grund (Pflichtfeld) <span className="text-[#C94B38]">*</span>
                </label>
                <Textarea
                  className="rounded-lg"
                  placeholder="Bitte beschreiben Sie, was korrigiert werden muss..."
                  rows={4}
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="update-standard" />
                <label htmlFor="update-standard" className="text-sm text-[#8E9094]">
                  Standard-Anweisung aktualisieren (optional)
                </label>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowBackToEditing(false)}
                className="rounded-lg"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => setShowBackToEditing(false)}
                className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg"
              >
                Zurückgeben
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Kundenfreigabe Modal */}
      {showCustomerApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-[#1A1A1C] mb-4">Kundenfreigabe senden</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">Nachricht (optional)</label>
                <Textarea
                  className="rounded-lg"
                  placeholder="Persönliche Nachricht an den Kunden..."
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm text-[#8E9094] mb-2 block">Sichtbarkeit</label>
                <select className="w-full h-10 px-3 rounded-lg border border-[#E5E5E5] bg-white">
                  <option>Nur Galerie</option>
                  <option>Galerie + ZIP-Download</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCustomerApproval(false)}
                className="rounded-lg"
              >
                Abbrechen
              </Button>
              <Button
                onClick={() => setShowCustomerApproval(false)}
                className="bg-[#C2352D] hover:bg-[#A92D26] text-white rounded-lg"
              >
                <Send className="w-4 h-4 mr-2" />
                Senden
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
