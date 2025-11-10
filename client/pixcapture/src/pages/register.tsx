import { useState } from "react";
import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function PixCaptureRegister() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwörter stimmen nicht überein",
        description: "Bitte überprüfen Sie Ihre Eingaben",
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Passwort zu kurz",
        description: "Das Passwort muss mindestens 8 Zeichen lang sein",
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/auth/signup", {
        email: formData.email,
        password: formData.password,
      });

      toast({
        title: "Registrierung erfolgreich",
        description: "Sie werden weitergeleitet...",
      });

      setTimeout(() => {
        window.location.href = "/pixcapture/dashboard";
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Registrierung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Registrieren – pixcapture.app"
        description="Erstellen Sie ein Konto und starten Sie mit der professionellen Bildbearbeitung"
        path="/pixcapture/register"
      />

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Link href="/pixcapture">
            <h1 
              className="text-2xl font-medium tracking-tight cursor-pointer text-black hover:text-gray-600 transition-colors"
              data-testid="brand-logo"
            >
              pixcapture.app
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 py-16">
        <Card className="w-full max-w-md border-gray-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-black">
              Konto erstellen
            </CardTitle>
            <CardDescription className="text-gray-600">
              Registrieren Sie sich für pixcapture.app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre.email@beispiel.de"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  data-testid="input-email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  data-testid="input-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  data-testid="input-confirm-password"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-register"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrieren...
                  </>
                ) : (
                  "Registrieren"
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600">
                Bereits registriert?{" "}
                <Link href="/pixcapture/login">
                  <span className="text-black font-medium hover:underline cursor-pointer" data-testid="link-login">
                    Jetzt anmelden
                  </span>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <FooterPixCapture />
    </div>
  );
}
