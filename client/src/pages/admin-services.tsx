import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminPageHeader } from '@/components/AdminPageHeader';
import type { Service } from '@shared/schema';

const CATEGORIES = [
  { value: 'photography', label: 'Fotografie' },
  { value: 'drone', label: 'Drohne' },
  { value: 'video', label: 'Video' },
  { value: '360tour', label: '360° Tour' },
  { value: 'staging', label: 'Virtual Staging' },
  { value: 'optimization', label: 'Optimierung' },
  { value: 'travel', label: 'Anfahrt' },
];

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

export default function AdminServices() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    serviceCode: '',
    category: 'photography',
    name: '',
    description: '',
    netPrice: '',
    priceNote: '',
    notes: '',
    isActive: 'true',
  });

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  if (authLoading || userLoading) return null;
  if (!userData) return null;

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({ title: "Service erstellt" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Service konnte nicht erstellt werden",
        variant: "destructive"
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      return await apiRequest('PATCH', `/api/services/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({ title: "Service aktualisiert" });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Service konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/services/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({ title: "Service gelöscht" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Service konnte nicht gelöscht werden",
        variant: "destructive"
      });
    },
  });

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceCode: service.serviceCode,
        category: service.category,
        name: service.name,
        description: service.description || '',
        netPrice: service.netPrice ? (service.netPrice / 100).toString() : '',
        priceNote: service.priceNote || '',
        notes: service.notes || '',
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        serviceCode: '',
        category: 'photography',
        name: '',
        description: '',
        netPrice: '',
        priceNote: '',
        notes: '',
        isActive: 'true',
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingService(null);
    setFormData({
      serviceCode: '',
      category: 'photography',
      name: '',
      description: '',
      netPrice: '',
      priceNote: '',
      notes: '',
      isActive: 'true',
    });
  };

  const handleSave = () => {
    const serviceData = {
      serviceCode: formData.serviceCode.toUpperCase(),
      category: formData.category,
      name: formData.name,
      description: formData.description || undefined,
      netPrice: formData.netPrice ? Math.round(parseFloat(formData.netPrice) * 100) : undefined,
      priceNote: formData.priceNote || undefined,
      notes: formData.notes || undefined,
      isActive: formData.isActive,
    };

    if (editingService) {
      updateMutation.mutate({
        id: editingService.id,
        updates: serviceData,
      });
    } else {
      createMutation.mutate(serviceData);
    }
  };

  const handleDelete = (service: Service) => {
    if (confirm(`Service "${service.name}" wirklich löschen?`)) {
      deleteMutation.mutate(service.id);
    }
  };

  const formatPrice = (cents: number | null, priceNote?: string | null) => {
    if (cents === null) {
      return priceNote || 'auf Anfrage';
    }
    return `€${(cents / 100).toFixed(2)}`;
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(c => c.value === category)?.label || category;
  };

  if (isLoading) {
    return (
      <AdminLayout userRole={userData.user.role}>
        <div className="flex flex-col h-full">
          <AdminPageHeader title="Services-Verwaltung" showBackButton />
          <div className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userRole={userData.user.role}>
      <div className="flex flex-col h-full">
        <AdminPageHeader 
          title="Services-Verwaltung" 
          showBackButton
          actions={
            <Button onClick={() => handleOpenDialog()} data-testid="button-new-service">
              <Plus className="h-4 w-4 mr-2" />
              Neuer Service
            </Button>
          }
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} data-testid={`card-service-${service.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" data-testid={`badge-code-${service.id}`}>
                            {service.serviceCode}
                          </Badge>
                          <Badge variant="secondary" data-testid={`badge-category-${service.id}`}>
                            {getCategoryLabel(service.category)}
                          </Badge>
                          {service.isActive === 'false' && (
                            <Badge variant="destructive">Inaktiv</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg" data-testid={`text-name-${service.id}`}>
                          {service.name}
                        </CardTitle>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <div className="text-right">
                          <div className="text-lg font-semibold" data-testid={`text-price-${service.id}`}>
                            {formatPrice(service.netPrice, service.priceNote)}
                          </div>
                          {service.netPrice && service.priceNote && (
                            <div className="text-xs text-muted-foreground">{service.priceNote}</div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(service)}
                          data-testid={`button-edit-${service.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(service)}
                          data-testid={`button-delete-${service.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {services.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Noch keine Services vorhanden
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {showDialog && (
        <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Service bearbeiten' : 'Neuer Service'}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Service-Code *
                  </label>
                  <Input
                    value={formData.serviceCode}
                    onChange={(e) => setFormData({...formData, serviceCode: e.target.value.toUpperCase()})}
                    placeholder="F10, D04, V30..."
                    maxLength={10}
                    data-testid="input-service-code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategorie *
                  </label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Fotopaket 10 Bilder"
                  data-testid="input-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Beschreibung
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detaillierte Beschreibung..."
                  className="min-h-[80px]"
                  data-testid="textarea-description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Netto-Preis (€)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.netPrice}
                    onChange={(e) => setFormData({...formData, netPrice: e.target.value})}
                    placeholder="0.00"
                    data-testid="input-net-price"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Leer lassen für "auf Anfrage"</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preis-Hinweis
                  </label>
                  <Input
                    value={formData.priceNote}
                    onChange={(e) => setFormData({...formData, priceNote: e.target.value})}
                    placeholder="€0.80/km, je Raumgröße..."
                    data-testid="input-price-note"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Interne Notizen
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Interne Hinweise..."
                  className="min-h-[60px]"
                  data-testid="textarea-notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Status
                </label>
                <Select value={formData.isActive} onValueChange={(v) => setFormData({...formData, isActive: v})}>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktiv</SelectItem>
                    <SelectItem value="false">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="flex-1"
                  disabled={!formData.serviceCode || !formData.name || !formData.category || createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-service"
                >
                  {editingService ? 'Aktualisieren' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
