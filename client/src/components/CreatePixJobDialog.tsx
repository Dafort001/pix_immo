import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { createJobSchema, type CreateJobInput, type Service } from '@shared/schema';
import { Calendar, Sun, Package, Users, Building2, Home, Briefcase, MapPin, Warehouse, TreePine } from 'lucide-react';
import { z } from 'zod';
import { GoogleMapsAddressInput } from './GoogleMapsAddressInput';
import { calculateSunPosition, formatSunPosition } from '@/lib/sun-position';
import { useState } from 'react';

type CreatePixJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Wohnung', icon: Home },
  { value: 'house', label: 'Haus', icon: Building2 },
  { value: 'office', label: 'Büro', icon: Briefcase },
  { value: 'commercial', label: 'Gewerbe', icon: Warehouse },
  { value: 'land', label: 'Grundstück', icon: TreePine },
] as const;

// Extend schema for frontend-specific validation
const pixJobFormSchema = createJobSchema.extend({
  appointmentDate: z.string().min(1, 'Bitte wählen Sie ein Datum'),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Ungültige Zeit'),
  brokerName: z.string().min(1, 'Name des Maklers ist erforderlich'),
  brokerPhone: z.string().min(1, 'Telefonnummer ist erforderlich'),
  brokerPresent: z.boolean(),
  contactPersonName: z.string().optional(),
  contactPersonPhone: z.string().optional(),
}).refine((data) => {
  if (data.brokerPresent === false) {
    return data.contactPersonName && data.contactPersonName.length > 0 && 
           data.contactPersonPhone && data.contactPersonPhone.length > 0;
  }
  return true;
}, {
  message: 'Ansprechpartner erforderlich, wenn Makler nicht anwesend',
  path: ['contactPersonName'],
});

type PixJobFormData = z.infer<typeof pixJobFormSchema>;

export function CreatePixJobDialog({ open, onOpenChange }: CreatePixJobDialogProps) {
  const { toast } = useToast();
  const [addressData, setAddressData] = useState<{
    lat: number;
    lng: number;
    formatted: string;
  } | null>(null);
  const [sunInfo, setSunInfo] = useState<string | null>(null);

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services'],
    enabled: open,
  });

  const photographyServices = services.filter(s => s.category === 'photography' && s.isActive === true);
  
  const form = useForm<PixJobFormData>({
    resolver: zodResolver(pixJobFormSchema),
    defaultValues: {
      customerName: '',
      propertyName: '',
      propertyType: undefined,
      propertyArea: undefined,
      propertyAddress: '',
      addressLat: '',
      addressLng: '',
      addressPlaceId: '',
      addressFormatted: '',
      appointmentDate: '',
      appointmentTime: '',
      serviceId: '',
      droneIncluded: false,
      brokerName: '',
      brokerPhone: '',
      brokerPresent: true,
      contactPersonName: '',
      contactPersonPhone: '',
      deliverGallery: true,
      deliverAlttext: true,
      deliverExpose: false,
    },
  });

  const brokerPresent = form.watch('brokerPresent');
  const appointmentDate = form.watch('appointmentDate');
  const appointmentTime = form.watch('appointmentTime');

  const handleAddressSelect = (address: any) => {
    form.setValue('addressLat', address.lat.toString());
    form.setValue('addressLng', address.lng.toString());
    form.setValue('addressPlaceId', address.placeId);
    form.setValue('addressFormatted', address.formatted);
    form.setValue('propertyAddress', address.formatted);
    
    setAddressData({
      lat: address.lat,
      lng: address.lng,
      formatted: address.formatted,
    });

    updateSunPosition(address.lat, address.lng, appointmentDate, appointmentTime);
  };

  const updateSunPosition = (lat?: number, lng?: number, date?: string, time?: string) => {
    const currentLat = lat ?? addressData?.lat;
    const currentLng = lng ?? addressData?.lng;
    const currentDate = date ?? appointmentDate;
    const currentTime = time ?? appointmentTime;

    if (currentLat && currentLng && currentDate && currentTime) {
      const dateTime = new Date(`${currentDate}T${currentTime}`);
      
      if (isNaN(dateTime.getTime())) {
        setSunInfo(null);
        return;
      }
      
      const position = calculateSunPosition(currentLat, currentLng, dateTime);
      setSunInfo(formatSunPosition(position));
    } else {
      setSunInfo(null);
    }
  };

  const createJobMutation = useMutation({
    mutationFn: async (data: PixJobFormData) => {
      const appointmentTimestamp = new Date(`${data.appointmentDate}T${data.appointmentTime}`).getTime();
      
      if (isNaN(appointmentTimestamp)) {
        throw new Error('Ungültiges Datum oder Uhrzeit für Termin');
      }
      
      const payload: CreateJobInput = {
        customerName: data.customerName,
        propertyName: data.propertyName,
        propertyType: data.propertyType,
        propertyArea: data.propertyArea,
        propertyAddress: data.propertyAddress,
        addressLat: data.addressLat,
        addressLng: data.addressLng,
        addressPlaceId: data.addressPlaceId,
        addressFormatted: data.addressFormatted,
        appointmentDate: appointmentTimestamp,
        appointmentTime: data.appointmentTime,
        serviceId: data.serviceId,
        droneIncluded: data.droneIncluded,
        brokerName: data.brokerName,
        brokerPhone: data.brokerPhone,
        brokerPresent: data.brokerPresent,
        contactPersonName: data.brokerPresent ? undefined : data.contactPersonName,
        contactPersonPhone: data.brokerPresent ? undefined : data.contactPersonPhone,
        deliverGallery: data.deliverGallery,
        deliverAlttext: data.deliverAlttext,
        deliverExpose: data.deliverExpose,
      };
      
      return await apiRequest('POST', '/api/pix-jobs', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pix-jobs'] });
      toast({ title: 'pix.immo Auftrag erstellt' });
      onOpenChange(false);
      form.reset();
      setAddressData(null);
      setSunInfo(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Auftrag konnte nicht erstellt werden',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: PixJobFormData) => {
    createJobMutation.mutate(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
    form.reset();
    setAddressData(null);
    setSunInfo(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">Neuer pix.immo Auftrag</DialogTitle>
          <DialogDescription data-testid="text-dialog-description">
            Erstellen Sie einen professionellen Fotografie-Auftrag
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Property Type */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Objekttyp *
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                        >
                          {PROPERTY_TYPES.map((type) => (
                            <div key={type.value} className="relative">
                              <RadioGroupItem
                                value={type.value}
                                id={type.value}
                                className="peer sr-only"
                                data-testid={`radio-property-type-${type.value}`}
                              />
                              <Label
                                htmlFor={type.value}
                                className="flex items-center gap-2 p-3 border-2 rounded-md cursor-pointer hover-elevate peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                              >
                                <type.icon className="h-5 w-5" />
                                <span>{type.label}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyArea"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Wohnfläche (optional)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="z.B. 120"
                            data-testid="input-property-area"
                          />
                          <span className="text-muted-foreground">m²</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 mb-4">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Objektadresse *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Geben Sie die vollständige Adresse ein und wählen Sie aus den Vorschlägen
                  </p>
                </div>
                <GoogleMapsAddressInput onAddressSelect={handleAddressSelect} />
              </CardContent>
            </Card>

            {/* Appointment */}
            <Card>
              <CardContent className="pt-6">
                <Label className="flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4" />
                  Terminvereinbarung *
                </Label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="appointmentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Datum *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                              field.onChange(e);
                              updateSunPosition(undefined, undefined, e.target.value, undefined);
                            }}
                            data-testid="input-appointment-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="appointmentTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Uhrzeit *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="time"
                            onChange={(e) => {
                              field.onChange(e);
                              updateSunPosition(undefined, undefined, undefined, e.target.value);
                            }}
                            data-testid="input-appointment-time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {sunInfo && (
                  <Card className="mt-4 bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span data-testid="text-sun-position">{sunInfo}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Service Package */}
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Service-Paket *
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-service-package">
                            <SelectValue placeholder="Wählen Sie ein Paket..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {servicesLoading ? (
                            <SelectItem value="loading" disabled>
                              Laden...
                            </SelectItem>
                          ) : photographyServices.length === 0 ? (
                            <SelectItem value="none" disabled>
                              Keine Pakete verfügbar
                            </SelectItem>
                          ) : (
                            photographyServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex items-center gap-2">
                                  <span>{service.name}</span>
                                  {service.netPrice && (
                                    <Badge variant="secondary">
                                      €{(service.netPrice / 100).toFixed(2)}
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Wählen Sie das gewünschte Fotografie-Paket
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="droneIncluded"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between mt-4 p-4 border rounded-md">
                      <div>
                        <FormLabel className="font-normal">Drohnenaufnahmen</FormLabel>
                        <FormDescription className="text-xs">
                          Inklusive Luftaufnahmen des Objekts
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-drone-included"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="mt-4 space-y-3">
                  <Label className="text-sm font-medium">Lieferumfang</Label>
                  
                  <FormField
                    control={form.control}
                    name="deliverGallery"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-deliver-gallery"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Galerie ausliefern
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliverAlttext"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-deliver-alttext"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Alt-Texte generieren
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliverExpose"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-deliver-expose"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Exposé erstellen
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customer & Broker Info */}
            <Card>
              <CardContent className="pt-6">
                <Label className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4" />
                  Kontaktdaten
                </Label>

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Kundenname / Firma (optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="z.B. Mustermann GmbH"
                          data-testid="input-customer-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Objektname *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="z.B. Villa am See"
                          data-testid="input-property-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brokerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name des Maklers *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Max Mustermann"
                            data-testid="input-broker-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brokerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefonnummer Makler *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="+49 123 456789"
                            data-testid="input-broker-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="brokerPresent"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Makler anwesend beim Termin? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                          className="flex gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="true" id="broker-yes" data-testid="radio-broker-present-yes" />
                            <Label htmlFor="broker-yes" className="font-normal cursor-pointer">
                              Ja
                            </Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="false" id="broker-no" data-testid="radio-broker-present-no" />
                            <Label htmlFor="broker-no" className="font-normal cursor-pointer">
                              Nein
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!brokerPresent && (
                  <Card className="mt-4 bg-muted/50">
                    <CardContent className="pt-4 space-y-4">
                      <p className="text-sm font-medium">Ansprechpartner vor Ort</p>
                      
                      <FormField
                        control={form.control}
                        name="contactPersonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ansprechpartner Name"
                                data-testid="input-contact-person-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPersonPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefonnummer *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder="+49 123 456789"
                                data-testid="input-contact-person-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                data-testid="button-cancel"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createJobMutation.isPending}
                data-testid="button-submit"
              >
                {createJobMutation.isPending ? 'Wird erstellt...' : 'Auftrag erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
