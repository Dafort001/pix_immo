import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { createJobSchema, type CreateJobInput } from '@shared/schema';
import { Calendar } from 'lucide-react';
import { z } from 'zod';

type CreatePixJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Extend schema for frontend-specific validation (date string → timestamp conversion)
const pixJobFormSchema = createJobSchema.extend({
  deadlineDate: z.string().optional(), // Frontend-only field for date input
});

type PixJobFormData = z.infer<typeof pixJobFormSchema>;

export function CreatePixJobDialog({ open, onOpenChange }: CreatePixJobDialogProps) {
  const { toast } = useToast();
  
  const form = useForm<PixJobFormData>({
    resolver: zodResolver(pixJobFormSchema),
    defaultValues: {
      customerName: '',
      propertyName: '',
      propertyAddress: '',
      deadlineDate: '',
      deliverGallery: true,
      deliverAlttext: true,
      deliverExpose: false,
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: PixJobFormData) => {
      const deadlineTimestamp = data.deadlineDate ? new Date(data.deadlineDate).getTime() : undefined;
      
      const payload: CreateJobInput = {
        customerName: data.customerName,
        propertyName: data.propertyName,
        propertyAddress: data.propertyAddress,
        deadlineAt: deadlineTimestamp,
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neuer pix.immo Auftrag</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen professionellen Fotografie-Auftrag
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kundenname</FormLabel>
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
                  <FormItem>
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
            </div>

            <FormField
              control={form.control}
              name="propertyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objektadresse</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="z.B. Musterstraße 123, 20095 Hamburg"
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
              name="deadlineDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        type="date"
                        data-testid="input-deadline"
                      />
                      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 pt-4 border-t">
              <FormLabel className="text-base font-medium">Lieferumfang</FormLabel>
              
              <FormField
                control={form.control}
                name="deliverGallery"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="font-normal">
                        Bildergalerie ausliefern
                      </FormLabel>
                      <FormDescription>
                        Hochauflösende Bilder für Website & Marketing
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-deliver-gallery"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverAlttext"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="font-normal">
                        Alt-Texte generieren
                      </FormLabel>
                      <FormDescription>
                        KI-generierte Bildbeschreibungen für SEO
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-deliver-alttext"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliverExpose"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel className="font-normal">
                        Exposé erstellen
                      </FormLabel>
                      <FormDescription>
                        KI-generiertes Exposé mit Objektbeschreibung
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-deliver-expose"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createJobMutation.isPending}
                data-testid="button-cancel-create"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createJobMutation.isPending}
                data-testid="button-submit-create"
              >
                {createJobMutation.isPending ? 'Erstelle...' : 'Auftrag erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
