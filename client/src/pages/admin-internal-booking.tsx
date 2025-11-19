import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus, ShoppingCart, Calendar, MapPin, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/AdminLayout';
import { AdminPageHeader } from '@/components/AdminPageHeader';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient, getQueryFn } from '@/lib/queryClient';
import type { Service } from '@shared/schema';

type User = {
  id: string;
  email: string;
  role: "client" | "admin" | "editor";
  createdAt: number;
};

const bookingSchema = z.object({
  contactName: z.string().min(1, "Kundenname erforderlich"),
  contactEmail: z.string().email("Ungültige E-Mail"),
  contactMobile: z.string().min(1, "Telefonnummer erforderlich"),
  propertyName: z.string().min(1, "Objektbezeichnung erforderlich"),
  propertyAddress: z.string().min(1, "Adresse erforderlich"),
  addressLat: z.string().optional(),
  addressLng: z.string().optional(),
  addressPlaceId: z.string().optional(),
  addressFormatted: z.string().optional(),
  propertyType: z.string().optional(),
  preferredDate: z.string().min(1, "Termin erforderlich"),
  preferredTime: z.string().min(1, "Uhrzeit erforderlich"),
  specialRequirements: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const categoryLabels: Record<string, string> = {
  photography: "📸 Fotopakete (Innen- & Außenaufnahmen)",
  drone: "🚁 Drohnenaufnahmen",
  video: "🎬 Videooptionen",
  "360tour": "🏠 Virtueller Rundgang (TML)",
  staging: "🖼️ Virtuelles Staging",
  optimization: "🧩 Bildoptimierung und KI-Retusche",
  travel: "🌍 Anfahrt und Service"
};

const categoryHelpTexts: Record<string, string> = {
  photography: "Pakete nach Anzahl finaler Bilder. Es werden immer mehr Motive fotografiert, als im Paket enthalten sind. Zusatzbilder werden später in der Galerie als FEX (6 €/Bild) abgerechnet. Quadratmeterangaben sind Richtwerte. Mehrere Wohneinheiten (z. B. Einliegerwohnung, getrennte Apartments): in der Regel F40 oder mehrere Pakete einplanen.",
  drone: "Drohnenpakete funktionieren analog zu den Fotopaketen. Es werden mehr Perspektiven aufgenommen, als im Paket enthalten sind. Zusatzbilder werden später in der Galerie als FEX (6 €/Bild) berechnet. Kombipreis mit F-Paketen verfügbar.",
  video: "Filmaufnahmen für Exposé, Website oder Social Media. Zeitlimit beachten. Zusatzmaterial wird nach Aufwand berechnet.",
  "360tour": "Virtuelle Besichtigung mit interaktiven Rundgängen. Anzahl der 360°-Standpunkte wählen. Zusätzliche Standpunkte nach Absprache."
};

const categoryOrder = [
  "photography",
  "drone",
  "video",
  "360tour"
];

export default function AdminInternalBooking() {
  const { isLoading: authLoading } = useAuthGuard({ requiredRole: "admin" });
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceQuantities, setServiceQuantities] = useState<Record<string, number>>({});

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn<{ user: User }>({ on401: "returnNull" }),
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      contactName: '',
      contactEmail: '',
      contactMobile: '',
      propertyName: '',
      propertyAddress: '',
      addressLat: '',
      addressLng: '',
      addressPlaceId: '',
      addressFormatted: '',
      propertyType: '',
      preferredDate: '',
      preferredTime: '',
      specialRequirements: '',
    },
  });

  // Load services from API
  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data: Service[]) => {
        // Filter only active services
        const activeServices = data.filter(s => s.isActive === "true");
        setServices(activeServices);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load services:", error);
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Preisliste konnte nicht geladen werden",
        });
        setIsLoading(false);
      });
  }, [toast]);

  const groupedServices = categoryOrder.map(category => ({
    category,
    label: categoryLabels[category],
    services: services.filter(s => s.category === category),
  })).filter(group => group.services.length > 0);

  const handleQuantityChange = (serviceId: string, delta: number) => {
    setServiceQuantities(prev => {
      const current = prev[serviceId] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [serviceId]: newValue };
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    let netTotal = 0;
    
    for (const [serviceId, quantity] of Object.entries(serviceQuantities)) {
      if (quantity > 0) {
        const service = services.find(s => s.id === serviceId);
        if (service && service.netPrice !== null) {
          netTotal += service.netPrice * quantity;
        }
      }
    }

    const vatAmount = Math.round(netTotal * 0.19);
    const grossTotal = netTotal + vatAmount;

    return {
      net: netTotal,
      vat: vatAmount,
      gross: grossTotal,
    };
  };

  const totals = calculateTotal();

  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormData & { serviceSelections: Record<string, number>; totalNetPrice: number; vatAmount: number; grossAmount: number }) => {
      return await apiRequest('POST', '/api/bookings', {
        ...data,
        agbAccepted: true, // Admin bookings automatically accept AGB
      });
    },
    onSuccess: () => {
      toast({
        title: "Buchung erstellt",
        description: "Die Buchung wurde erfolgreich angelegt und eine SMS-Bestätigung versendet.",
      });
      form.reset();
      setServiceQuantities({});
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/all'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Buchung konnte nicht erstellt werden",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    // Validate at least one service selected
    if (Object.values(serviceQuantities).every(qty => qty === 0)) {
      toast({
        variant: "destructive",
        title: "Keine Leistungen ausgewählt",
        description: "Bitte wählen Sie mindestens eine Leistung aus",
      });
      return;
    }

    const currentTotals = calculateTotal();

    bookingMutation.mutate({
      ...data,
      serviceSelections: serviceQuantities,
      totalNetPrice: currentTotals.net,
      vatAmount: currentTotals.vat,
      grossAmount: currentTotals.gross,
    });
  };

  if (authLoading || userLoading) return null;
  if (!userData) return null;

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Interne Buchung"
        description="Neue Buchung für Kunden anlegen"
      />

      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Travel Policy Info */}
        <Alert className="bg-primary/5 border-primary/20" data-testid="alert-travel-policy">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Anfahrt:</strong> Anfahrt bis 40 km um Hamburg ist im Preis enthalten. Darüber hinaus Fahrtkosten nur nach individueller Absprache, keine automatische Berechnung im System.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Service Selection */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leistungen auswählen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : (
                      groupedServices.map(group => (
                        <div key={group.category} className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg">{group.label}</h3>
                            {categoryHelpTexts[group.category] && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {categoryHelpTexts[group.category]}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            {group.services.map(service => (
                              <div
                                key={service.id}
                                className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                                data-testid={`service-${service.serviceCode}`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono">
                                      {service.serviceCode}
                                    </Badge>
                                    <span className="font-medium">{service.name}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {service.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {service.netPrice !== null ? (
                                      <span className="text-sm font-semibold">
                                        €{(service.netPrice / 100).toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-sm font-semibold text-muted-foreground">
                                        {service.priceNote || "auf Anfrage"}
                                      </span>
                                    )}
                                    {service.notes && (
                                      <span className="text-xs text-muted-foreground">
                                        ({service.notes})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {service.netPrice !== null && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleQuantityChange(service.id, -1)}
                                      disabled={!serviceQuantities[service.id]}
                                      data-testid={`button-decrease-${service.serviceCode}`}
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-semibold" data-testid={`quantity-${service.serviceCode}`}>
                                      {serviceQuantities[service.id] || 0}
                                    </span>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => handleQuantityChange(service.id, 1)}
                                      data-testid={`button-increase-${service.serviceCode}`}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {group.category !== categoryOrder[categoryOrder.length - 1] && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      ))
                    )}
                    {!isLoading && (
                      <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                        <strong>Hinweis:</strong> Staging- und Optimierungsleistungen werden nicht vorab gebucht, sondern später pro Bild in der Galerie ausgewählt.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Customer & Property Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Kunden- & Objektdaten</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kundenname / Makler</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Max Mustermann / Makler GmbH" data-testid="input-contact-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-Mail</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="makler@example.com" data-testid="input-contact-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactMobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefonnummer (für SMS)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+49 170 1234567" data-testid="input-contact-mobile" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="propertyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objektbezeichnung</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Moderne 3-Zimmer-Wohnung" data-testid="input-property-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objektadresse</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Straße und Hausnummer, PLZ Ort&#10;z.B. Große Elbstraße 133, 22767 Hamburg"
                              rows={2}
                              data-testid="input-property-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objekttyp</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue placeholder="Objekttyp wählen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Wohnung">Wohnung</SelectItem>
                              <SelectItem value="Haus">Haus</SelectItem>
                              <SelectItem value="Gewerbe">Gewerbe</SelectItem>
                              <SelectItem value="Grundstück">Grundstück</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="preferredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Terminwunsch (Datum)</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" data-testid="input-preferred-date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Uhrzeit</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" data-testid="input-preferred-time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="rounded-lg bg-muted p-4 text-sm">
                      <p className="font-semibold mb-1">ℹ️ Anfahrt</p>
                      <p className="text-muted-foreground">
                        Bis 40 km Umkreis um Hamburg sind die Anfahrtskosten im Paketpreis enthalten. 
                        Bei größeren Entfernungen werden zusätzliche Fahrtkosten individuell abgesprochen.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="specialRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Besondere Anforderungen</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Optional..." data-testid="input-special-requirements" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Checkout Summary */}
              <div className="space-y-4">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Zusammenfassung
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Ausgewählte Leistungen:</h4>
                      {Object.entries(serviceQuantities).filter(([, qty]) => qty > 0).length === 0 ? (
                        <p className="text-sm text-muted-foreground">Keine Leistungen ausgewählt</p>
                      ) : (
                        <div className="space-y-1">
                          {Object.entries(serviceQuantities)
                            .filter(([, qty]) => qty > 0)
                            .map(([serviceId, qty]) => {
                              const service = services.find(s => s.id === serviceId);
                              if (!service) return null;
                              return (
                                <div key={serviceId} className="flex justify-between text-sm">
                                  <span>
                                    {qty}x {service.name}
                                  </span>
                                  {service.netPrice && (
                                    <span className="font-medium">
                                      €{((service.netPrice * qty) / 100).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Netto</span>
                        <span className="font-medium" data-testid="text-netTotal">
                          €{(totals.net / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>MwSt. (19%)</span>
                        <span className="font-medium" data-testid="text-vatAmount">
                          €{(totals.vat / 100).toFixed(2)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Gesamt (brutto)</span>
                        <span data-testid="text-grossTotal">€{(totals.gross / 100).toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={bookingMutation.isPending || Object.values(serviceQuantities).every(qty => qty === 0)}
                      data-testid="button-submit"
                    >
                      {bookingMutation.isPending ? "Buchung wird erstellt..." : "Buchung erstellen"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Eine Bestätigungs-SMS wird automatisch an die angegebene Telefonnummer versendet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
}
