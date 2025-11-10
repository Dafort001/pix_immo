import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { ArrowLeft, Eye, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@shared/components';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import type { Booking, BookingItem, Service } from '@shared/schema';

type BookingStatus = 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  inProgress: 'In Bearbeitung',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
};

const STATUS_VARIANTS: Record<BookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  inProgress: 'default',
  completed: 'default',
  cancelled: 'destructive',
};

const REGION_LABELS: Record<string, string> = {
  HH: 'Hamburg',
  B: 'Berlin',
  EXT: 'Extended',
};

export default function AdminBookings() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<{ booking: Booking; items: BookingItem[] } | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  if (authLoading) return null;

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/all'],
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: string; status: BookingStatus }) => {
      return await apiRequest('PATCH', `/api/bookings/${data.id}/status`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/all'] });
      toast({ title: "Status aktualisiert" });
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Status konnte nicht aktualisiert werden",
        variant: "destructive"
      });
    },
  });

  const handleViewDetails = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking details');
      const data = await response.json();
      setSelectedBooking(data);
      setShowDetailsDialog(true);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Buchungsdetails konnten nicht geladen werden",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateStatusMutation.mutate({ id: bookingId, status: newStatus });
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    const regionMatch = regionFilter === 'all' || booking.region === regionFilter;
    return statusMatch && regionMatch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title="Buchungsverwaltung | Admin"
        description="Verwaltung aller Buchungen"
      />
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="ghost"
                onClick={() => setLocation('/admin')}
                className="mb-4 hover-elevate"
                data-testid="button-back-admin"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
              <h1 className="text-lg font-bold">Buchungsverwaltung</h1>
              <p className="text-muted-foreground mt-1">
                {filteredBookings.length} von {bookings.length} Buchungen
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="confirmed">Bestätigt</SelectItem>
                    <SelectItem value="inProgress">In Bearbeitung</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Region</label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger data-testid="select-region-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Regionen</SelectItem>
                    <SelectItem value="HH">Hamburg</SelectItem>
                    <SelectItem value="B">Berlin</SelectItem>
                    <SelectItem value="EXT">Extended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Datum</th>
                      <th className="p-4 font-medium">Immobilie</th>
                      <th className="p-4 font-medium">Kontakt</th>
                      <th className="p-4 font-medium">Region</th>
                      <th className="p-4 font-medium">Betrag</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Keine Buchungen gefunden
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="border-b hover-elevate">
                          <td className="p-4">
                            {new Date(booking.createdAt).toLocaleDateString('de-DE')}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{booking.propertyName}</div>
                            {booking.propertyAddress && (
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {booking.propertyAddress}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              {booking.contactName && <div className="font-medium">{booking.contactName}</div>}
                              <div className="text-muted-foreground">{booking.contactMobile}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {REGION_LABELS[booking.region] || booking.region}
                            </Badge>
                            {booking.region === 'EXT' && booking.kilometers && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {booking.kilometers} km
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium">
                              {((booking.grossAmount || 0) / 100).toFixed(2)} €
                            </div>
                            <div className="text-xs text-muted-foreground">
                              inkl. MwSt.
                            </div>
                          </td>
                          <td className="p-4">
                            <Select
                              value={booking.status}
                              onValueChange={(value) => handleStatusChange(booking.id, value as BookingStatus)}
                            >
                              <SelectTrigger className="w-40" data-testid={`select-status-${booking.id}`}>
                                <SelectValue>
                                  <Badge variant={STATUS_VARIANTS[booking.status as BookingStatus]}>
                                    {STATUS_LABELS[booking.status as BookingStatus]}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(booking.id)}
                              className="hover-elevate"
                              data-testid={`button-view-${booking.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buchungsdetails</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Immobilie</h3>
                  <p className="font-medium">{selectedBooking.booking.propertyName}</p>
                  {selectedBooking.booking.propertyAddress && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.booking.propertyAddress}</p>
                  )}
                  {selectedBooking.booking.propertyType && (
                    <Badge variant="outline" className="mt-2">
                      {selectedBooking.booking.propertyType}
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Kontakt</h3>
                  {selectedBooking.booking.contactName && (
                    <p className="text-sm">{selectedBooking.booking.contactName}</p>
                  )}
                  <p className="text-sm text-muted-foreground">{selectedBooking.booking.contactMobile}</p>
                  {selectedBooking.booking.contactEmail && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.booking.contactEmail}</p>
                  )}
                </div>
              </div>

              {/* Preferred Date/Time */}
              {(selectedBooking.booking.preferredDate || selectedBooking.booking.preferredTime) && (
                <div>
                  <h3 className="font-semibold mb-2">Wunschtermin</h3>
                  <p className="text-sm">
                    {selectedBooking.booking.preferredDate && (
                      <span>{new Date(selectedBooking.booking.preferredDate).toLocaleDateString('de-DE')}</span>
                    )}
                    {selectedBooking.booking.preferredTime && (
                      <span className="ml-2">{selectedBooking.booking.preferredTime}</span>
                    )}
                  </p>
                </div>
              )}

              {/* Special Requirements */}
              {selectedBooking.booking.specialRequirements && (
                <div>
                  <h3 className="font-semibold mb-2">Besondere Anforderungen</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.booking.specialRequirements}</p>
                </div>
              )}

              {/* Booking Items */}
              <div>
                <h3 className="font-semibold mb-2">Gebuchte Leistungen</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Leistung</th>
                        <th className="text-right p-3 font-medium">Menge</th>
                        <th className="text-right p-3 font-medium">Einzelpreis</th>
                        <th className="text-right p-3 font-medium">Gesamt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBooking.items.map((item) => {
                        const service = services.find(s => s.id === item.serviceId);
                        return (
                          <tr key={item.id} className="border-t">
                            <td className="p-3">
                              <div className="font-medium">{service?.name || item.serviceId}</div>
                              {service && (
                                <div className="text-xs text-muted-foreground">
                                  {service.serviceCode} · {service.category}
                                </div>
                              )}
                            </td>
                            <td className="text-right p-3">{item.quantity}</td>
                            <td className="text-right p-3">{((item.unitPrice || 0) / 100).toFixed(2)} €</td>
                            <td className="text-right p-3 font-medium">
                              {((item.totalPrice || 0) / 100).toFixed(2)} €
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="border-t bg-muted">
                      <tr>
                        <td colSpan={3} className="text-right p-3 font-medium">Netto:</td>
                        <td className="text-right p-3 font-medium">
                          {((selectedBooking.booking.totalNetPrice || 0) / 100).toFixed(2)} €
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="text-right p-3">MwSt. (19%):</td>
                        <td className="text-right p-3">
                          {((selectedBooking.booking.vatAmount || 0) / 100).toFixed(2)} €
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td colSpan={3} className="text-right p-3 font-bold">Brutto:</td>
                        <td className="text-right p-3 font-bold">
                          {((selectedBooking.booking.grossAmount || 0) / 100).toFixed(2)} €
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Buchungs-ID:</span> {selectedBooking.booking.id}
                </div>
                <div>
                  <span className="font-medium">Erstellt:</span>{' '}
                  {new Date(selectedBooking.booking.createdAt).toLocaleString('de-DE')}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
