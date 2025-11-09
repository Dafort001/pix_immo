import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Aktuelles Passwort erforderlich"),
  newPassword: z.string().min(8, "Neues Passwort muss mindestens 8 Zeichen lang sein"),
  confirmPassword: z.string().min(1, "Passwortbestätigung erforderlich"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      form.reset();
      toast({
        title: "Erfolg",
        description: "Passwort wurde erfolgreich geändert",
      });
      
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Fehler",
        description: error.message || "Passwortänderung fehlgeschlagen",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zum Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>Passwort ändern</CardTitle>
                <CardDescription>
                  Aktualisieren Sie Ihr Passwort für mehr Sicherheit
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showSuccess && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Passwort erfolgreich geändert! Sie werden weitergeleitet...
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelles Passwort *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Aktuelles Passwort eingeben"
                          {...field}
                          data-testid="input-current-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neues Passwort *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mindestens 8 Zeichen"
                          {...field}
                          data-testid="input-new-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passwort bestätigen *</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Neues Passwort wiederholen"
                          {...field}
                          data-testid="input-confirm-password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    data-testid="button-submit-password"
                  >
                    {changePasswordMutation.isPending ? "Wird geändert..." : "Passwort ändern"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                    data-testid="button-cancel"
                  >
                    Abbrechen
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Passwort-Anforderungen:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Mindestens 8 Zeichen lang</li>
            <li>• Verwenden Sie eine Kombination aus Buchstaben, Zahlen und Sonderzeichen</li>
            <li>• Vermeiden Sie leicht zu erratende Passwörter</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
