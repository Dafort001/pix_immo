import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, FileText, Send, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SEOHead } from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: number;
  grossAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
}

export default function AdminInvoices() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    serviceDescription: '',
    netAmount: '',
  });

  const mockInvoices: Invoice[] = [];

  const stats = {
    draft: 0,
    sent: 0,
    paid: 0,
    total: 0,
    totalRevenue: 0,
  };

  const handleCreateInvoice = () => {
    const netAmount = parseFloat(formData.netAmount) || 0;
    const vatAmount = Math.round(netAmount * 0.19 * 100) / 100;
    const grossAmount = netAmount + vatAmount;

    toast({
      title: "Rechnung erstellt",
      description: `Rechnung über ${grossAmount.toFixed(2)}€ (inkl. 19% MwSt.) wurde erstellt`,
    });

    setShowCreateDialog(false);
    setFormData({
      customerName: '',
      customerEmail: '',
      customerAddress: '',
      serviceDescription: '',
      netAmount: '',
    });
  };

  const getNextInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = stats.total + 1;
    return `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      sent: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      paid: 'bg-green-500/10 text-green-600 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    };

    const labels = {
      draft: 'Entwurf',
      sent: 'Versendet',
      paid: 'Bezahlt',
      cancelled: 'Storniert',
    };

    return <Badge variant="outline" className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="Rechnungen – pix.immo Admin" description="Rechnungsverwaltung" path="/admin/invoices" />

      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/dashboard')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Rechnungen</h1>
                <p className="text-gray-600">Erstelle und verwalte Rechnungen</p>
              </div>
            </div>

            <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-invoice">
              <Plus className="h-5 w-5 mr-2" />
              Neue Rechnung
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 text-sm">{stats.total} Rechnungen</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Entwürfe: {stats.draft}</Badge>
              <Badge variant="outline">Versendet: {stats.sent}</Badge>
              <Badge variant="outline">Bezahlt: {stats.paid}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-gray-600 text-sm font-semibold">
                {stats.totalRevenue.toFixed(2)}€ Gesamtumsatz
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {mockInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Noch keine Rechnungen</h3>
              <p className="text-gray-600 text-center mb-6">
                Erstelle deine erste Rechnung für abgeschlossene Aufträge
              </p>
              <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first">
                <Plus className="h-4 w-4 mr-2" />
                Erste Rechnung erstellen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mockInvoices.map((invoice) => (
              <Card key={invoice.id} data-testid={`invoice-card-${invoice.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{invoice.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {(invoice.grossAmount / 100).toFixed(2)}€
                      </p>
                      {getStatusBadge(invoice.status)}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>

      {showCreateDialog && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Rechnung erstellen</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Rechnungsnummer
                  </label>
                  <Input value={getNextInvoiceNumber()} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Rechnungsdatum
                  </label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kundenname *
                </label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  placeholder="Engel & Völkers Hamburg"
                  data-testid="input-customer-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Kunden E-Mail *
                </label>
                <Input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  placeholder="kontakt@kunde.de"
                  data-testid="input-customer-email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Rechnungsadresse
                </label>
                <Textarea
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                  placeholder="Straße, PLZ Ort"
                  className="min-h-[80px]"
                  data-testid="textarea-address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Leistungsbeschreibung *
                </label>
                <Textarea
                  value={formData.serviceDescription}
                  onChange={(e) => setFormData({...formData, serviceDescription: e.target.value})}
                  placeholder="Professionelle Immobilienfotografie inkl. Bearbeitung..."
                  className="min-h-[100px]"
                  data-testid="textarea-service"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nettobetrag (€) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.netAmount}
                    onChange={(e) => setFormData({...formData, netAmount: e.target.value})}
                    placeholder="450.00"
                    data-testid="input-net-amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    MwSt. (19%)
                  </label>
                  <Input
                    value={formData.netAmount ? (parseFloat(formData.netAmount) * 0.19).toFixed(2) : '0.00'}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Bruttobetrag
                  </label>
                  <Input
                    value={formData.netAmount ? (parseFloat(formData.netAmount) * 1.19).toFixed(2) : '0.00'}
                    disabled
                    className="font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleCreateInvoice} 
                  className="flex-1"
                  disabled={!formData.customerName || !formData.customerEmail || !formData.serviceDescription || !formData.netAmount}
                  data-testid="button-create"
                >
                  Rechnung erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
