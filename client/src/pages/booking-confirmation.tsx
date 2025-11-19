import { useParams, useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, MapPin, Package, Home } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingItem {
  id: string;
  serviceId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Booking {
  id: string;
  userId: string;
  contactName: string | null;
  contactEmail: string | null;
  contactMobile: string;
  propertyName: string;
  propertyAddress: string | null;
  preferredDate: string | null;
  preferredTime: string | null;
  status: string;
  totalNetPrice: number;
  vatAmount: number;
  grossAmount: number;
}

interface Service {
  id: string;
  name: string;
  serviceCode: string;
}

export default function BookingConfirmation() {
  const params = useParams();
  const bookingId = params.id;
  const [, setLocation] = useLocation();

  // Fetch booking details
  const { data, isLoading, error } = useQuery<{ booking: Booking; items: BookingItem[] }>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: !!bookingId,
  });

  // Fetch all services to map service IDs to names
  const { data: services } = useQuery<Service[]>({
    queryKey: ['/api/services'],
  });

  // Calculate slot end time (90 minutes after start)
  const getSlotEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
    return `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
  };

  // Format date as DD.MM.YYYY
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex h-16 items-center">
            <Link href="/">
              <div className="text-lg font-semibold tracking-tight cursor-pointer" data-testid="brand-logo">
                PIX.IMMO
              </div>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mt-2 mx-auto" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container flex h-16 items-center">
            <Link href="/">
              <div className="text-lg font-semibold tracking-tight cursor-pointer" data-testid="brand-logo">
                PIX.IMMO
              </div>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-destructive text-center">Buchung nicht gefunden</CardTitle>
              <CardDescription className="text-center">
                Die angeforderte Buchung konnte nicht geladen werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => setLocation('/buchen')} data-testid="button-back-booking">
                Neue Buchung erstellen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { booking, items } = data;

  // Get service names for booked items
  const serviceNames = items.map(item => {
    const service = services?.find(s => s.id === item.serviceId);
    const name = service ? `${service.serviceCode} - ${service.name}` : 'Service';
    return item.quantity > 1 ? `${name} (${item.quantity}x)` : name;
  });

  const slotEndTime = booking.preferredTime ? getSlotEndTime(booking.preferredTime) : '';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="text-lg font-semibold tracking-tight cursor-pointer" data-testid="brand-logo">
              PIX.IMMO
            </div>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" data-testid="button-header-dashboard">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 flex items-center justify-center">
        <Card className="w-full max-w-2xl" data-testid="card-booking-confirmation">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" data-testid="icon-success" />
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold" data-testid="text-confirmation-title">
                Ihre Buchung war erfolgreich
              </CardTitle>
              <CardDescription className="mt-2 text-base" data-testid="text-confirmation-subtitle">
                Vielen Dank. Ihr Termin wurde fest eingetragen.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Booking Details Box */}
            <div className="space-y-4 rounded-lg border p-6 bg-muted/30">
              <h3 className="font-semibold text-lg mb-4" data-testid="text-details-heading">
                Ihre Buchungsdetails
              </h3>

              {/* Name */}
              <div className="grid grid-cols-[120px_1fr] gap-4">
                <div className="text-sm text-muted-foreground font-medium">Name:</div>
                <div className="font-medium" data-testid="text-customer-name">
                  {booking.contactName || 'Nicht angegeben'}
                </div>
              </div>

              {/* Appointment Date & Time */}
              {booking.preferredDate && booking.preferredTime && (
                <div className="flex items-start gap-3 pt-2">
                  <Calendar className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground font-medium mb-1">Termin:</div>
                    <div className="font-semibold text-lg" data-testid="text-appointment-datetime">
                      {formatDate(booking.preferredDate)}, {booking.preferredTime}–{slotEndTime} Uhr
                    </div>
                  </div>
                </div>
              )}

              {/* Property Address */}
              {booking.propertyAddress && (
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground font-medium mb-1">Adresse:</div>
                    <div className="font-medium" data-testid="text-property-address">
                      {booking.propertyAddress}
                    </div>
                  </div>
                </div>
              )}

              {/* Services */}
              {serviceNames.length > 0 && (
                <div className="flex items-start gap-3 pt-2">
                  <Package className="w-5 h-5 mt-0.5 text-primary" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground font-medium mb-2">Leistungen:</div>
                    <div className="space-y-1.5">
                      {serviceNames.map((name, index) => (
                        <div key={index} className="font-medium" data-testid={`text-service-${index}`}>
                          • {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground text-center leading-relaxed" data-testid="text-additional-info">
                Sie erhalten zusätzlich eine Bestätigung per SMS.
                <br />
                Bei Fragen: <a href="mailto:info@pix.immo" className="text-primary hover:underline font-medium">info@pix.immo</a>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/dashboard')}
                data-testid="button-to-dashboard"
                className="w-full sm:w-auto"
              >
                <Home className="mr-2 h-4 w-4" />
                Zum Dashboard
              </Button>
              <Button 
                onClick={() => setLocation('/buchen')}
                data-testid="button-new-booking"
                className="w-full sm:w-auto"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Weitere Buchung
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
