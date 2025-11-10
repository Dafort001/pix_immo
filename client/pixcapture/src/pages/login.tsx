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
import { FooterPixCapture } from "../components/FooterPixCapture";
import { ArrowLeft } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function PixCaptureLogin() {
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
    onSuccess: () => {
      toast({
        title: "Login erfolgreich",
        description: "Willkommen bei pixcapture!",
      });
      setLocation("/pixcapture/dashboard");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login fehlgeschlagen",
        description: error.message,
      });
      setIsLoading(false);
    },
  });

  const onSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Login – pixcapture.app"
        description="Melden Sie sich bei pixcapture.app an, um Ihre Immobilienfotos zu verwalten."
        path="/pixcapture/login"
      />
      
      {/* Header */}
      <div className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/pixcapture">
            <h1 
              className="text-2xl font-medium tracking-tight cursor-pointer text-black hover:text-gray-600 transition-colors"
              data-testid="brand-logo"
            >
              pixcapture.app
            </h1>
          </Link>
          <Link href="/pixcapture">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft size={16} />
              Zurück
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-gray-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-medium text-black">Willkommen zurück</CardTitle>
              <CardDescription className="text-gray-600">
                Melden Sie sich an, um Ihre Fotos zu verwalten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">E-Mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ihre@email.de"
                            className="border-gray-300"
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
                        <FormLabel className="text-black">Passwort</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Ihr Passwort"
                            className="border-gray-300"
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
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? "Anmeldung läuft..." : "Anmelden"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>
                  Noch kein Account?{" "}
                  <Link href="/pixcapture/register">
                    <span className="text-black hover:underline cursor-pointer" data-testid="link-register">
                      Registrieren
                    </span>
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <FooterPixCapture />
    </div>
  );
}
