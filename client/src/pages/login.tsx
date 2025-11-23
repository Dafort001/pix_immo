import { useState } from "react";
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
import { SEOHead } from "@shared/components";

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Anmeldung erfolgreich",
        description: "Willkommen zurück!",
      });
      
      // Role-based redirect
      if (response.user?.role === "admin") {
        setLocation("/admin/jobs");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
      });
      setIsLoading(false);
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <SEOHead
        title="Login - PIX.IMMO"
        description="Melden Sie sich in Ihrem PIX.IMMO Account an."
        path="/login"
      />
      <div className="flex items-center justify-center px-4 pt-24 pb-12">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Willkommen zurück</CardTitle>
              <CardDescription>Melden Sie sich an, um fortzufahren</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ihre@email.de"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Passwort</FormLabel>
                        <Link href="/request-password-reset">
                          <span className="text-sm text-primary hover:underline cursor-pointer" data-testid="link-forgot-password">
                            Passwort vergessen?
                          </span>
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Ihr Passwort"
                          data-testid="input-password"
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
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Anmeldung läuft..." : "Anmelden"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Oder
                  </span>
                </div>
              </div>

              <Link href="/login-otp">
                <Button variant="outline" className="w-full" data-testid="button-login-otp">
                  Mit Code anmelden
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Noch kein Konto? </span>
              <Link href="/register">
                <span className="font-medium text-primary hover:underline cursor-pointer" data-testid="link-register">
                  Registrieren
                </span>
              </Link>
            </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
