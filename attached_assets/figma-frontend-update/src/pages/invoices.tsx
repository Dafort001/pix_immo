import { useState } from 'react';
import { Link } from 'wouter';
import {
  Download,
  Search,
  ArrowUpDown,
  ArrowLeft,
  Menu,
  FileText,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

type InvoiceStatus = 'paid' | 'open' | 'overdue';

interface Invoice {
  id: string;
  date: string;
  jobId: string;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string;
}

export default function Invoices() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const invoices: Invoice[] = [
    {
      id: 'INV-2024-001',
      date: '01.11.2024',
      jobId: 'JOB-2024-1105',
      amount: 1250.0,
      status: 'paid',
      pdfUrl: '#',
    },
    {
      id: 'INV-2024-002',
      date: '15.10.2024',
      jobId: 'JOB-2024-1015',
      amount: 890.0,
      status: 'paid',
      pdfUrl: '#',
    },
    {
      id: 'INV-2024-003',
      date: '28.09.2024',
      jobId: 'JOB-2024-0928',
      amount: 1450.0,
      status: 'open',
      pdfUrl: '#',
    },
    {
      id: 'INV-2024-004',
      date: '12.09.2024',
      jobId: 'JOB-2024-0912',
      amount: 750.0,
      status: 'paid',
      pdfUrl: '#',
    },
    {
      id: 'INV-2024-005',
      date: '05.08.2024',
      jobId: 'JOB-2024-0805',
      amount: 320.0,
      status: 'overdue',
      pdfUrl: '#',
    },
    {
      id: 'INV-2024-006',
      date: '20.07.2024',
      jobId: 'JOB-2024-0720',
      amount: 2100.0,
      status: 'paid',
      pdfUrl: '#',
    },
  ];

  const getStatusBadge = (status: InvoiceStatus) => {
    const config = {
      paid: { label: 'Bezahlt', color: 'bg-[#64BF49]', icon: CheckCircle2 },
      open: { label: 'Offen', color: 'bg-[#C9B55A]', icon: Clock },
      overdue: { label: 'Überfällig', color: 'bg-[#C94B38]', icon: Clock },
    };

    const { label, color, icon: Icon } = config[status];
    return (
      <Badge className={`${color} text-white hover:${color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const filteredInvoices = invoices
    .filter(
      (invoice) =>
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.jobId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        const dateA = new Date(a.date.split('.').reverse().join('-'));
        const dateB = new Date(b.date.split('.').reverse().join('-'));
        comparison = dateA.getTime() - dateB.getTime();
      } else if (sortField === 'amount') {
        comparison = a.amount - b.amount;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const openAmount = invoices
    .filter((inv) => inv.status === 'open' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/">
                <span className="text-2xl tracking-tight">PIX.IMMO</span>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <nav className="hidden lg:flex items-center gap-6">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">Abmelden</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E9E9E9] py-4 px-4">
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="w-full justify-start">Abmelden</Button>
            </Link>
          </nav>
        </div>
      )}

      {/* Title */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <h1 className="text-2xl">Rechnungen</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Gesamt</div>
              <div className="text-2xl">€ {totalAmount.toFixed(2)}</div>
            </div>
            <div className="bg-[#F0FDF4] border border-[#64BF49]/20 rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Bezahlt</div>
              <div className="text-2xl text-[#64BF49]">€ {paidAmount.toFixed(2)}</div>
            </div>
            <div className="bg-[#FEF3F2] border border-[#C94B38]/20 rounded-lg p-4">
              <div className="text-sm text-[#8E9094] mb-1">Offen</div>
              <div className="text-2xl text-[#C94B38]">€ {openAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-[#E9E9E9]">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E9094]" />
              <Input
                type="text"
                placeholder="Rechnungs-ID oder Job-ID suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link href="/settings">
              <Button variant="outline">
                Rechnungsadresse bearbeiten
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-4 lg:px-8 py-8 w-full">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('date')}
                      className="flex items-center gap-1 hover:text-[#1A1A1C]"
                    >
                      Datum
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Rechnungs-ID</TableHead>
                  <TableHead>Job-ID</TableHead>
                  <TableHead>
                    <button
                      onClick={() => toggleSort('amount')}
                      className="flex items-center gap-1 hover:text-[#1A1A1C]"
                    >
                      Betrag
                      <ArrowUpDown className="h-4 w-4" />
                    </button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.jobId}</TableCell>
                    <TableCell>€ {invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-[#E9E9E9]">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm mb-1">{invoice.id}</div>
                    <div className="text-xs text-[#8E9094]">{invoice.date}</div>
                  </div>
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-[#8E9094] mb-1">Job-ID</div>
                    <div className="text-sm">{invoice.jobId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#8E9094] mb-1">Betrag</div>
                    <div className="text-sm">€ {invoice.amount.toFixed(2)}</div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  PDF Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E9E9E9] mt-auto">
        <div className="h-32"></div>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#8E9094]">
            <div>© 2024 PIX.IMMO. Alle Rechte vorbehalten.</div>
            <div className="flex gap-6">
              <Link href="/impressum" className="hover:text-[#1A1A1C]">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-[#1A1A1C]">Datenschutz</Link>
              <Link href="/agb" className="hover:text-[#1A1A1C]">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
