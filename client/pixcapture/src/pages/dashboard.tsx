import { Link } from "wouter";
import { SEOHead } from "@shared/components";
import { FooterPixCapture } from "../components/FooterPixCapture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, Clock, CheckCircle, ArrowLeft, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function PixCaptureDashboard() {
  const { toast } = useToast();

  // Check if user is authenticated
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Bis bald!",
      });
      window.location.href = "/pixcapture";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler beim Abmelden",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user || isError) {
    toast({
      variant: "destructive",
      title: "Nicht angemeldet",
      description: "Bitte melden Sie sich an, um fortzufahren.",
    });
    window.location.href = "/pixcapture/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SEOHead
        title="Dashboard – pixcapture.app"
        description="Verwalten Sie Ihre Immobilienfotos und Aufträge"
        path="/pixcapture/dashboard"
      />

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/pixcapture">
            <h1 
              className="text-2xl font-medium tracking-tight cursor-pointer text-black hover:text-gray-600 transition-colors"
              data-testid="brand-logo"
            >
              pixcapture.app
            </h1>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2"
            data-testid="button-logout"
          >
            <LogOut size={16} />
            Abmelden
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Welcome Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4 text-black">
              Willkommen, {user.email}
            </h2>
            <p className="text-lg text-gray-600">
              Hier können Sie Ihre Immobilienfotos hochladen und verwalten
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Upload Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Upload className="text-blue-600" size={24} />
                </div>
                <CardTitle className="text-black">Fotos hochladen</CardTitle>
                <CardDescription className="text-gray-600">
                  Laden Sie neue Immobilienfotos hoch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  data-testid="button-upload"
                  disabled
                >
                  Kommt bald
                </Button>
              </CardContent>
            </Card>

            {/* Gallery Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Image className="text-green-600" size={24} />
                </div>
                <CardTitle className="text-black">Meine Fotos</CardTitle>
                <CardDescription className="text-gray-600">
                  Alle hochgeladenen Bilder ansehen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Kommt bald
                </Button>
              </CardContent>
            </Card>

            {/* Orders Card */}
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <Clock className="text-purple-600" size={24} />
                </div>
                <CardTitle className="text-black">Meine Aufträge</CardTitle>
                <CardDescription className="text-gray-600">
                  Status Ihrer Bearbeitungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled>
                  Kommt bald
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <CheckCircle className="text-green-600" size={20} />
                So funktioniert's
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-black">Fotos hochladen</p>
                    <p className="text-sm text-gray-600">
                      Wählen Sie Ihre Immobilienfotos aus (JPEG, PNG, HEIC)
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-black">Bearbeitungsstil wählen</p>
                    <p className="text-sm text-gray-600">
                      Natural, Bright oder Dramatic - Sie entscheiden
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-black">Bearbeitung abwarten</p>
                    <p className="text-sm text-gray-600">
                      Professionelle Bearbeitung innerhalb von 24-48 Stunden
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-black">Fotos herunterladen</p>
                    <p className="text-sm text-gray-600">
                      Hochauflösende, bearbeitete Bilder für Ihr Exposé
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>

      <FooterPixCapture />
    </div>
  );
}
