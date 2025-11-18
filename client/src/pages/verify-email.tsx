import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);

  // Extract token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    setToken(tokenParam);
  }, []);

  // Verify email when token is available
  const { data, error, isLoading } = useQuery({
    queryKey: ["/api/auth/verify-email", token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/auth/verify-email?token=${token}`);
      return res.json();
    },
  });

  // Auto-redirect to dashboard after successful verification
  useEffect(() => {
    if (data?.user) {
      const timer = setTimeout(() => {
        // Redirect based on role
        if (data.user.role === "admin") {
          setLocation("/admin/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [data, setLocation]);

  // Loading state
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
              <CardDescription>Kein Verifizierungs-Token gefunden</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Bitte verwende den vollständigen Link aus deiner E-Mail.
              </p>
              <Link href="/register">
                <Button className="w-full" data-testid="button-register">
                  Zur Registrierung
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
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
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <CardTitle>E-Mail wird verifiziert...</CardTitle>
              <CardDescription>Bitte warten</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const errorMessage = (error as any)?.message || "E-Mail-Verifizierung fehlgeschlagen";
    
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Verifizierung fehlgeschlagen</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Der Verifizierungs-Link ist möglicherweise abgelaufen oder wurde bereits verwendet.
                </p>
              </div>
              
              <div className="space-y-3">
                <Link href="/register">
                  <Button className="w-full" data-testid="button-register">
                    Erneut registrieren
                  </Button>
                </Link>
                <Link href="/login-otp">
                  <Button variant="outline" className="w-full" data-testid="button-login">
                    Zum Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
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
            <CardTitle>E-Mail verifiziert!</CardTitle>
            <CardDescription>
              {data?.alreadyVerified 
                ? "Deine E-Mail-Adresse wurde bereits verifiziert"
                : "Dein Konto wurde erfolgreich aktiviert"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.user && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Willkommen zurück!</p>
                <p className="text-sm text-muted-foreground">
                  {data.user.firstName} {data.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.user.email}
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm text-center text-muted-foreground">
              <p>
                {data?.alreadyVerified 
                  ? "Du wirst in Kürze weitergeleitet..."
                  : "Du bist jetzt angemeldet und wirst in Kürze weitergeleitet..."
                }
              </p>
            </div>

            <div className="pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  if (data?.user?.role === "admin") {
                    setLocation("/admin/dashboard");
                  } else {
                    setLocation("/dashboard");
                  }
                }}
                data-testid="button-dashboard"
              >
                Zum Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
