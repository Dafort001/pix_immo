import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle } from "lucide-react";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Das Passwort muss mindestens 8 Zeichen lang sein"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    setToken(tokenParam);
  }, []);

  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      if (!token) {
        throw new Error("Kein Token gefunden");
      }
      
      const res = await apiRequest("POST", "/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: (response) => {
      setResetSuccess(true);
      toast({
        title: "Passwort zurückgesetzt",
        description: response.message,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Passwort-Reset fehlgeschlagen",
      });
    },
  });

  const onSubmit = (data: ResetPasswordData) => {
    resetPasswordMutation.mutate(data);
  };

  // Auto-redirect to login after successful reset
  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        setLocation("/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, setLocation]);

  // No token state
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/">
              <div className="inline-flex items-center cursor-pointer">
                <span className="text-base font-semibold tracking-wide">PIX.IMMO</span>
              </div>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <XCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>Ungültiger Link</CardTitle>
              <CardDescription>Kein Reset-Token gefunden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Bitte verwende den vollständigen Link aus deiner E-Mail.
              </p>
              <Link href="/request-password-reset">
                <Button className="w-full" data-testid="button-request-reset">
                  Neuen Link anfordern
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/">
              <div className="inline-flex items-center cursor-pointer">
                <span className="text-base font-semibold tracking-wide">PIX.IMMO</span>
              </div>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Passwort zurückgesetzt!</CardTitle>
              <CardDescription>Du kannst dich jetzt anmelden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Dein Passwort wurde erfolgreich geändert. Du wirst in Kürze zum Login weitergeleitet.
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => setLocation("/login")}
                data-testid="button-login"
              >
                Jetzt anmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="inline-flex items-center cursor-pointer">
              <span className="text-base font-semibold tracking-wide">PIX.IMMO</span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Neues Passwort setzen</CardTitle>
            <CardDescription>
              Wähle ein neues Passwort für dein Konto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Neues Passwort</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Mindestens 8 Zeichen"
                          data-testid="input-newPassword"
                          {...field}
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
                      <FormLabel>Passwort wiederholen</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Passwort wiederholen"
                          data-testid="input-confirmPassword"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={resetPasswordMutation.isPending}
                  data-testid="button-submit"
                >
                  {resetPasswordMutation.isPending ? "Wird gespeichert..." : "Passwort ändern"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                  Zurück zum Login
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
