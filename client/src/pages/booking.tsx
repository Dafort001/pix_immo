import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, AlertCircle, Info } from "lucide-react";
import { AddressAutocomplete } from "@shared/components";
import type { AddressValidationResult } from "@shared/components";
import { StaticMapThumbnail } from "@shared/components";
import { TimeSlotPicker } from "@/components/TimeSlotPicker";

// Service types for booking wizard frontend (DTO from backend)
interface ServiceData {
  id: string; // Service UUID for backend mapping
  code: string;
  category: string;
  title: string;
  description: string;
  price_net: number | null; // In euros (converted from cents)
  unit: "flat" | "per_item" | "per_km" | "range" | "from";
  price_range?: string;
  price_from?: string;
  notes: string;
}

interface ServiceCatalog {
  services: ServiceData[];
  meta: {
    currency: string;
    vat_rate: number;
    last_updated: string;
  };
}

// Validation patterns
const germanPostalCodeRegex = /\b\d{5}\b/;

// Phone validation: extract digits and check if valid German number
function isValidGermanPhone(phone: string): boolean {
  if (!phone) return false;
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('49')) {
    return digits.length >= 11 && digits.length <= 15;
  }
  if (digits.startsWith('0')) {
    return digits.length >= 10 && digits.length <= 14;
  }
  return false;
}

const bookingSchema = z.object({
  contactName: z.string().optional(),
  contactEmail: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  contactMobile: z.string()
    .min(1, "Mobilnummer erforderlich")
    .refine(isValidGermanPhone, "Ungültige Mobilnummer (z.B. +49 170 1234567 oder 0170 1234567)"),
  propertyName: z.string().min(1, "Objektbezeichnung erforderlich"),
  propertyAddress: z.string()
    .optional()
    .refine(
      (addr) => !addr || addr.length === 0 || addr.length >= 10,
      { message: "Adresse muss mindestens 10 Zeichen lang sein" }
    )
    .refine(
      (addr) => !addr || addr.length === 0 || germanPostalCodeRegex.test(addr),
      { message: "Adresse muss eine gültige Postleitzahl (5 Ziffern) enthalten" }
    ),
  // Google Maps verified address data (hidden fields)
  addressLat: z.string().optional(),
  addressLng: z.string().optional(),
  addressPlaceId: z.string().optional(),
  addressFormatted: z.string().optional(),
  propertyType: z.string().optional(),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  specialRequirements: z.string().optional(),
  agbAccepted: z.boolean().refine((val) => val === true, {
    message: "AGB müssen akzeptiert werden",
  }),
  serviceSelections: z.record(z.number().min(0)),
}).refine((data) => {
  // At least one service must be selected with quantity > 0
  return Object.values(data.serviceSelections).some(qty => qty > 0);
}, {
  message: "Mindestens ein Service muss ausgewählt werden",
  path: ["serviceSelections"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

const categoryLabels: Record<string, string> = {
  photography: "Fotopakete (Innen- & Außenaufnahmen)",
  content: "Text & SEO-Services",
  drone: "Drohnenaufnahmen",
  video: "Videooptionen",
  "360tour": "Virtueller Rundgang (TML)",
  staging: "Virtuelles Staging",
  optimization: "Bildoptimierung und KI-Retusche",
  travel: "Anfahrt und Service"
};

const categoryDescriptions: Record<string, string> = {
  photography: "Die Pakete unterscheiden sich in der Anzahl der finalen Bilder und der typischen Objektgröße. Die Quadratmeterangaben sind reine Richtwerte – im Zweifel stimmen wir den Umfang mit Ihnen ab.",
  content: "Professionelle Texterstellung für Ihre Immobilie. Alt-Texte verbessern die Auffindbarkeit in Bildersuchmaschinen (SEO), werden als CSV-Datei für CRM-Systeme (Fido, Propstack, onOffice, etc.) geliefert und sind Voraussetzung für die KI-gestützte Exposé-Texterstellung.",
  drone: "Drohnenaufnahmen zeigen Ihre Immobilie aus der Luft und ergänzen die klassischen Innen- und Außenfotos. Wählen Sie zwischen Einzelbuchung (200€) oder vergünstigtem Kombipaket mit einem Fotopaket (100€).",
  video: "Auf Wunsch können wir ausgewählte Videooptionen als Ergänzung zu den Fotopaketen produzieren. Die genauen Inhalte und die Länge der Clips stimmen wir nach der Buchung mit Ihnen ab. Die aktuell angezeigten Videopakete verstehen sich als Richtwerte. Das Angebot wird in den nächsten Monaten weiter verfeinert.",
  "360tour": "Mit dem virtuellen Rundgang (TML) können Interessenten Ihre Immobilie online begehen – ähnlich wie bei einer 360°-Tour. Wir erstellen dafür eine Tour mit ausgewählten Standpunkten in Ihrer Immobilie. Erweiterte Spezialtouren oder hochauflösende Varianten bieten wir aktuell bewusst nicht an, um Aufwand und Kosten überschaubar zu halten."
};

const categoryOrder = [
  "photography",
  "content",
  "drone",
  "video",
  "360tour"
];

function formatPrice(priceNet: number | null, unit: string, priceRange?: string, priceFrom?: string): string {
  if (priceRange) return priceRange;
  if (priceFrom) return priceFrom;
  if (priceNet === null) return "auf Anfrage";
  
  if (unit === "per_km") {
    return `€${priceNet.toFixed(2).replace(".", ",")}/km`;
  }
  if (unit === "per_item") {
    return `€${priceNet.toFixed(2).replace(".", ",")}/Stück`;
  }
  
  return `€${priceNet.toFixed(2).replace(".", ",")}`;
}

export default function Booking() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});
  const [services, setServices] = useState<ServiceCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load services from API (catalog endpoint for booking wizard)
  useEffect(() => {
    fetch("/api/services/catalog")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: ServiceCatalog) => {
        setServices(data);
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

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      contactName: "",
      contactEmail: "",
      contactMobile: "",
      propertyName: "",
      propertyAddress: "",
      addressLat: "",
      addressLng: "",
      addressPlaceId: "",
      addressFormatted: "",
      propertyType: "",
      preferredDate: "",
      preferredTime: "",
      specialRequirements: "",
      agbAccepted: false,
      serviceSelections: {},
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      // Map service codes to service IDs for backend
      const serviceSelections: Record<string, number> = {};
      Object.entries(selectedServices).forEach(([code, qty]) => {
        if (qty > 0) {
          const service = services?.services.find(s => s.code === code);
          if (service) {
            serviceSelections[service.id] = qty; // Use service ID for backend
          }
        }
      });

      // Calculate total prices in cents
      const totalNetCents = Math.round(totalNet * 100);
      const vatAmountCents = Math.round(vatAmount * 100);
      const grossAmountCents = Math.round(totalGross * 100);

      const bookingPayload = {
        contactName: data.contactName || undefined,
        contactEmail: data.contactEmail || undefined,
        contactMobile: data.contactMobile,
        propertyName: data.propertyName,
        propertyAddress: data.propertyAddress || undefined,
        // Google Maps verified address data
        addressLat: data.addressLat || undefined,
        addressLng: data.addressLng || undefined,
        addressPlaceId: data.addressPlaceId || undefined,
        addressFormatted: data.addressFormatted || undefined,
        propertyType: data.propertyType || undefined,
        preferredDate: data.preferredDate || undefined,
        preferredTime: data.preferredTime || undefined,
        specialRequirements: data.specialRequirements || undefined,
        totalNetPrice: totalNetCents,
        vatAmount: vatAmountCents,
        grossAmount: grossAmountCents,
        agbAccepted: data.agbAccepted,
        serviceSelections,
      };

      const response = await apiRequest("POST", "/api/bookings", bookingPayload);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Buchung erfolgreich",
        description: "Ihre Buchung wurde übermittelt. Sie erhalten in Kürze eine SMS-Bestätigung.",
      });
      // Redirect to confirmation page with booking ID
      const bookingId = data.booking?.id || data.id;
      setLocation(`/booking-confirmation/${bookingId}`);
    },
    onError: (error: any) => {
      // Check if this is a race condition error (slot no longer available)
      const isSlotUnavailable = error.message?.includes('SLOT_NOT_AVAILABLE') || 
                                error.message?.includes('nicht mehr verfügbar');
      
      toast({
        variant: "destructive",
        title: isSlotUnavailable ? "Termin nicht mehr verfügbar" : "Fehler",
        description: isSlotUnavailable 
          ? "Dieser Termin ist leider nicht mehr verfügbar. Bitte wählen Sie einen anderen Slot."
          : (error.message || "Buchung konnte nicht erstellt werden"),
        duration: isSlotUnavailable ? 7000 : 5000, // Longer duration for slot unavailable
      });
      
      // If slot unavailable, scroll back to time picker to select new slot
      if (isSlotUnavailable) {
        setCurrentStep(2); // Go back to step 2 (Details with slot picker)
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!services || !services.services || !Array.isArray(services.services)) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-muted-foreground">Preisliste konnte nicht geladen werden</p>
          <Button onClick={() => setLocation("/dashboard")} className="mt-4">
            Zurück zum Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const servicesByCategory = services.services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, ServiceData[]>);

  const calculateTotal = () => {
    let total = 0;
    Object.entries(selectedServices).forEach(([code, quantity]) => {
      if (quantity > 0) {
        const service = services.services.find(s => s.code === code);
        if (service && service.price_net !== null) {
          if (service.unit === "per_item") {
            total += service.price_net * quantity;
          } else {
            // flat
            total += service.price_net;
          }
        }
      }
    });
    return total;
  };

  const totalNet = calculateTotal();
  const vatAmount = totalNet * 0.19;
  const totalGross = totalNet + vatAmount;

  const handleServiceToggle = (code: string, quantity: number) => {
    setSelectedServices(prev => {
      const updated = {
        ...prev,
        [code]: quantity,
      };
      // Sync to form state for validation
      form.setValue("serviceSelections", updated, { shouldValidate: true });
      return updated;
    });
  };

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  const selectedCount = Object.values(selectedServices).filter(q => q > 0).length;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => step === 1 ? setLocation("/dashboard") : setStep(step - 1)}
                data-testid="button-back"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {step === 1 ? "Dashboard" : "Zurück"}
              </Button>
              <h1 className="text-base font-semibold" data-testid="heading-booking">Fotobuchung für Ihre Immobilie</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant={step === 1 ? "default" : "outline"} 
                  data-testid="badge-step-1"
                  className={step > 1 ? "cursor-pointer hover-elevate" : ""}
                  onClick={() => step > 1 && setStep(1)}
                >
                  1. Leistungen
                </Badge>
                <Badge 
                  variant={step === 2 ? "default" : "outline"} 
                  data-testid="badge-step-2"
                  className={step !== 2 ? "cursor-pointer hover-elevate" : ""}
                  onClick={() => {
                    // Can only go to step 2 if step 1 is valid
                    if (step === 1 && selectedCount > 0) {
                      setStep(2);
                    } else if (step > 2) {
                      setStep(2);
                    }
                  }}
                >
                  2. Details
                </Badge>
                <Badge 
                  variant={step === 3 ? "default" : "outline"} 
                  data-testid="badge-step-3"
                  className={step !== 3 ? "cursor-not-allowed opacity-50" : ""}
                >
                  3. Prüfen
                </Badge>
              </div>
              
              <div className="flex flex-col items-end" data-testid="sticky-price-summary">
                <p className="text-xs text-muted-foreground">Gesamtpreis</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-medium" data-testid="text-sticky-price-net">
                    €{totalNet.toFixed(2).replace(".", ",")}
                  </p>
                  <p className="text-xs text-muted-foreground">netto</p>
                </div>
                <p className="text-xs text-muted-foreground" data-testid="text-sticky-price-gross">
                  €{totalGross.toFixed(2).replace(".", ",")} inkl. MwSt
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {step === 1 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-2">Leistungen auswählen</h2>
                <p className="text-muted-foreground">
                  Wählen Sie die Leistungen aus, die Sie für Ihre Immobilie benötigen.
                  Die Anzahl der Bilder bezieht sich immer auf die final bearbeiteten Fotos, die Sie nach dem Shooting in einer Online-Galerie auswählen können. Es werden grundsätzlich mehr Motive fotografiert, als im Paket enthalten sind. Zusätzliche Bilder können Sie bei Bedarf später kostenpflichtig dazu buchen.
                </p>
              </div>
              {selectedCount > 0 && (
                <Badge variant="secondary" data-testid="badge-selected-count">
                  {selectedCount} {selectedCount === 1 ? "Leistung" : "Leistungen"} ausgewählt
                </Badge>
              )}
            </div>

            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Anfahrt:</strong> Die Anfahrt im Raum Hamburg ist bis zu einer Entfernung von 40 km im Preis enthalten.
                Bei größeren Entfernungen können zusätzliche Fahrtkosten entstehen. Diese werden immer vorab individuell mit Ihnen abgesprochen. Es gibt dafür keine automatische Pauschale im Buchungsformular.
              </AlertDescription>
            </Alert>

            {categoryOrder.map((categoryKey) => {
              const categoryServices = servicesByCategory[categoryKey];
              if (!categoryServices || categoryServices.length === 0) return null;

              return (
                <div key={categoryKey}>
                  <div data-testid={`category-${categoryKey}`} className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-2">{categoryLabels[categoryKey]}</h3>
                      {categoryDescriptions[categoryKey] && (
                        <p className="text-sm text-muted-foreground">{categoryDescriptions[categoryKey]}</p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {categoryServices.map((service) => {
                        const isDisabled = service.price_net === null;
                        const quantity = selectedServices[service.code] || 0;
                        
                        return (
                          <Card key={service.code} data-testid={`service-${service.code}`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="secondary" data-testid={`code-${service.code}`}>
                                      {service.code}
                                    </Badge>
                                    <CardTitle className="text-base">{service.title}</CardTitle>
                                  </div>
                                  {service.description && (
                                    <CardDescription className="text-sm">{service.description}</CardDescription>
                                  )}
                                </div>
                                <div className="shrink-0 text-right">
                                  <div className="text-base font-medium" data-testid={`price-${service.code}`}>
                                    {formatPrice(service.price_net, service.unit, service.price_range, service.price_from)}
                                  </div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={quantity > 0}
                                  disabled={isDisabled}
                                  onCheckedChange={(checked) => {
                                    handleServiceToggle(service.code, checked ? 1 : 0);
                                  }}
                                  data-testid={`checkbox-${service.code}`}
                                />
                                {!isDisabled && service.unit !== "flat" && (
                                  <div className="flex items-center gap-2">
                                    <label className="text-sm text-muted-foreground">Anzahl:</label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={quantity || ""}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        handleServiceToggle(service.code, val);
                                      }}
                                      className="w-20"
                                      disabled={isDisabled}
                                      data-testid={`input-quantity-${service.code}`}
                                    />
                                  </div>
                                )}
                                {isDisabled && (
                                  <span className="text-sm text-muted-foreground">
                                    Preis auf Anfrage - bitte im nächsten Schritt beschreiben
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {categoryKey === "photography" && (
                    <div className="space-y-3 mt-6">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Objekte über 200 m²:</strong> Bei Wohnungen oder Häusern über 200 m² ist mindestens das <strong>Standard-Paket (20 Bilder)</strong> erforderlich. Für größere Objekte empfehlen wir das Plus-Paket (25 Bilder) oder Premium-Paket (30 Bilder).
                        </AlertDescription>
                      </Alert>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Einliegerwohnungen & mehrere Einheiten:</strong> Wenn Ihre Immobilie aus mehreren getrennten Wohneinheiten besteht (z. B. Hauptwohnung + Einliegerwohnung), entstehen zusätzliche Kosten (Aufpreis mind. 50€ nach Absprache). Wählen Sie ein Basis-Paket und kontaktieren Sie uns für ein individuelles Angebot.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  
                  {categoryKey === "content" && (
                    <Alert className="mt-6">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Wichtiger Hinweis zur Exposé-Texterstellung:</strong> Die KI-gestützte Exposé-Texterstellung benötigt Alt-Texte als Grundlage. Bitte buchen Sie "Alt-Texte für KI-Bildsuche" zusätzlich, wenn Sie ein Basis-Exposé wünschen. Alt-Texte verbessern außerdem die Auffindbarkeit Ihrer Bilder in Suchmaschinen.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}

            <div className="space-y-4 mt-8">
              <div>
                <h3 className="text-base font-semibold mb-2">Zusätzliche Bilder & Bildbearbeitung</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Nach dem Shooting erhalten Sie eine Online-Galerie mit mehr Motiven, als in Ihrem Paket enthalten sind.
                </p>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>In der Galerie können Sie:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>zusätzliche Bilder gegen Aufpreis auswählen und</li>
                  <li>optionale Bildbearbeitungen (z. B. Objektentfernung, Aufräumen, virtuelles Staging) für einzelne Bilder beauftragen.</li>
                </ul>
                <p className="mt-3">
                  Diese Zusatzleistungen müssen nicht vorab gebucht werden. Sie entscheiden später direkt in der Galerie, was Sie wirklich benötigen.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Zwischensumme (netto)</p>
                <p className="text-base font-semibold" data-testid="text-subtotal">
                  €{totalNet.toFixed(2).replace(".", ",")}
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  setStep(2);
                }}
                disabled={selectedCount === 0}
                data-testid="button-continue-step1"
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-6">Kontakt & Objektdetails</h2>
            
            <Form {...form}>
              <form className="space-y-6">
                {/* Contact Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Kontaktdaten</h3>
                  
                  <FormField
                    control={form.control}
                    name="contactMobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobilnummer *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+49 170 1234567" 
                            {...field} 
                            data-testid="input-contact-mobile" 
                          />
                        </FormControl>
                        <FormDescription>
                          Sie erhalten eine SMS-Bestätigung
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Max Mustermann (optional)" 
                            {...field} 
                            data-testid="input-contact-name" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-Mail</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="max@example.com (optional)" 
                            {...field} 
                            data-testid="input-contact-email" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Property Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Objektinformationen</h3>

                  <FormField
                    control={form.control}
                    name="propertyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objektbezeichnung *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Musterwohnung Hamburg-Mitte" {...field} data-testid="input-property-name" />
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
                        <FormControl>
                          <AddressAutocomplete
                            value={field.value || ""}
                            onChange={field.onChange}
                            onValidated={(result: AddressValidationResult) => {
                              // Store validated address data in hidden fields
                              form.setValue("addressLat", result.lat || "", { shouldValidate: true, shouldDirty: true });
                              form.setValue("addressLng", result.lng || "", { shouldValidate: true, shouldDirty: true });
                              form.setValue("addressPlaceId", result.placeId || "", { shouldValidate: true, shouldDirty: true });
                              form.setValue("addressFormatted", result.formattedAddress || "", { shouldValidate: true, shouldDirty: true });
                            }}
                            label="Adresse (optional)"
                            placeholder="Straße, Hausnummer, PLZ, Stadt"
                            testId="input-property-address"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Hidden fields for Google Maps data */}
                  <FormField control={form.control} name="addressLat" render={({ field }) => <input type="hidden" {...field} />} />
                  <FormField control={form.control} name="addressLng" render={({ field }) => <input type="hidden" {...field} />} />
                  <FormField control={form.control} name="addressPlaceId" render={({ field }) => <input type="hidden" {...field} />} />
                  <FormField control={form.control} name="addressFormatted" render={({ field }) => <input type="hidden" {...field} />} />

                  {/* Static Map Preview - shown when address is validated */}
                  {form.watch("addressLat") && form.watch("addressLng") && (
                    <StaticMapThumbnail
                      lat={form.watch("addressLat") || ""}
                      lng={form.watch("addressLng") || ""}
                      address={form.watch("addressFormatted") || form.watch("propertyAddress") || ""}
                      showAddress={true}
                      className="mt-2"
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objekttyp</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue placeholder="Bitte wählen (optional)" />
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

                  {/* Time Slot Picker - replaces manual date/time inputs */}
                  <TimeSlotPicker
                    lat={form.watch("addressLat")}
                    lng={form.watch("addressLng")}
                    selectedDate={form.watch("preferredDate")}
                    selectedTime={form.watch("preferredTime")}
                    onSlotSelect={(date, time) => {
                      form.setValue("preferredDate", date, { shouldValidate: true, shouldDirty: true });
                      form.setValue("preferredTime", time, { shouldValidate: true, shouldDirty: true });
                    }}
                    dateError={form.formState.errors.preferredDate}
                    timeError={form.formState.errors.preferredTime}
                  />
                  
                  {/* Hidden fields to store selected date/time for form validation */}
                  <FormField control={form.control} name="preferredDate" render={({ field }) => <input type="hidden" {...field} />} />
                  <FormField control={form.control} name="preferredTime" render={({ field }) => <input type="hidden" {...field} />} />

                  <FormField
                    control={form.control}
                    name="specialRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Besondere Anforderungen</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Besondere Wünsche, Zugangsinformationen, etc." 
                            rows={4}
                            {...field} 
                            data-testid="input-special-requirements"
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Beschreiben Sie hier spezielle Anforderungen oder Leistungen "auf Anfrage"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    data-testid="button-back-step2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Zurück
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      form.trigger(["contactMobile", "propertyName"]).then((isValid) => {
                        if (isValid) {
                          setStep(3);
                        }
                      });
                    }}
                    data-testid="button-continue-step2"
                  >
                    Weiter zur Prüfung
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-6">Bestellung prüfen</h2>
            
            <Form {...form}>
              <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kontaktinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Mobilnummer:</span>
                    <p className="font-medium" data-testid="text-review-mobile">{form.getValues("contactMobile")}</p>
                  </div>
                  {form.getValues("contactName") && (
                    <div>
                      <span className="text-sm text-muted-foreground">Name:</span>
                      <p className="font-medium">{form.getValues("contactName")}</p>
                    </div>
                  )}
                  {form.getValues("contactEmail") && (
                    <div>
                      <span className="text-sm text-muted-foreground">E-Mail:</span>
                      <p className="font-medium">{form.getValues("contactEmail")}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objektinformationen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Objektbezeichnung:</span>
                    <p className="font-medium" data-testid="text-review-property-name">{form.getValues("propertyName")}</p>
                  </div>
                  {form.getValues("propertyAddress") && (
                    <div>
                      <span className="text-sm text-muted-foreground">Adresse:</span>
                      <p className="font-medium" data-testid="text-review-property-address">{form.getValues("propertyAddress")}</p>
                    </div>
                  )}
                  {form.getValues("propertyType") && (
                    <div>
                      <span className="text-sm text-muted-foreground">Objekttyp:</span>
                      <p className="font-medium">{form.getValues("propertyType")}</p>
                    </div>
                  )}
                  {form.getValues("preferredDate") && (
                    <div>
                      <span className="text-sm text-muted-foreground">Wunschtermin:</span>
                      <p className="font-medium">
                        {form.getValues("preferredDate")}
                        {form.getValues("preferredTime") && ` um ${form.getValues("preferredTime")}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ausgewählte Leistungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(selectedServices)
                      .filter(([, quantity]) => quantity > 0)
                      .map(([code, quantity]) => {
                        const service = services.services.find(s => s.code === code);
                        if (!service) return null;
                        
                        let subtotal = 0;
                        if (service.price_net) {
                          if (service.unit === "per_item") {
                            subtotal = service.price_net * quantity;
                          } else {
                            subtotal = service.price_net;
                          }
                        }
                        
                        return (
                          <div key={code} className="flex items-center justify-between" data-testid={`review-service-${service.code}`}>
                            <div className="flex-1">
                              <p className="font-medium">{service.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {quantity}x {formatPrice(service.price_net, service.unit, service.price_range, service.price_from)}
                              </p>
                            </div>
                            <p className="font-medium">
                              {subtotal > 0 ? `€${subtotal.toFixed(2).replace(".", ",")}` : "auf Anfrage"}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Zwischensumme (netto)</span>
                      <span data-testid="text-review-subtotal">€{totalNet.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">MwSt. (19%)</span>
                      <span data-testid="text-review-tax">€{vatAmount.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-lg font-semibold">
                      <span>Gesamtpreis (brutto)</span>
                      <span data-testid="text-review-total">€{totalGross.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AGB Checkbox */}
              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="agbAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-agb"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Ich habe die Datenschutzerklärung und die Allgemeinen Geschäftsbedingungen gelesen und akzeptiere sie. *
                          </FormLabel>
                          <FormDescription>
                            <a href="/datenschutz" target="_blank" className="underline hover:text-primary">
                              Datenschutzerklärung lesen
                            </a>
                            {" · "}
                            <a href="/agb" target="_blank" className="underline hover:text-primary">
                              AGB lesen
                            </a>
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Ihre Anfrage wird zunächst geprüft. Der Termin gilt erst als endgültig bestätigt, wenn wir ihn Ihnen separat per E-Mail oder SMS bestätigen.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  data-testid="button-back-step3"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
                <Button
                  size="lg"
                  onClick={() => {
                    form.handleSubmit(
                      (data) => {
                        onSubmit(data);
                      },
                      (errors) => {
                        console.error("Form validation failed:", errors);
                        toast({
                          variant: "destructive",
                          title: "Formularfehler",
                          description: "Bitte überprüfen Sie Ihre Eingaben. Es gibt Validierungsfehler.",
                        });
                      }
                    )();
                  }}
                  disabled={createBookingMutation.isPending || !form.getValues("agbAccepted")}
                  data-testid="button-submit-booking"
                >
                  {createBookingMutation.isPending ? "Wird gesendet..." : "Buchung absenden"}
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
