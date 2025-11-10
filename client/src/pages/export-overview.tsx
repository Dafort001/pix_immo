import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download } from "lucide-react";

export default function ExportOverview() {
  const pages = [
    { category: "Marketing & Public", items: [
      { name: "Homepage", url: "/", filename: "home.html" },
      { name: "About", url: "/about", filename: "about.html" },
      { name: "Preise", url: "/preise", filename: "pricing.html" },
      { name: "Preisliste", url: "/preisliste", filename: "preisliste.html" },
      { name: "Blog", url: "/blog", filename: "blog.html" },
      { name: "Galerie", url: "/galerie", filename: "galerie.html" },
      { name: "Downloads", url: "/downloads", filename: "downloads.html" },
      { name: "Kontakt", url: "/kontakt", filename: "contact.html" },
      { name: "FAQ", url: "/faq", filename: "faq.html" },
      { name: "Impressum", url: "/impressum", filename: "imprint.html" },
      { name: "AGB", url: "/agb", filename: "agb.html" },
    ]},
    { category: "Auth", items: [
      { name: "Login", url: "/login", filename: "login.html" },
      { name: "Register", url: "/register", filename: "register.html" },
    ]},
    { category: "Mobile PWA", items: [
      { name: "App Splash", url: "/app", filename: "app-splash.html" },
      { name: "App Camera", url: "/app/camera", filename: "app-camera.html" },
      { name: "App Gallery", url: "/app/gallery", filename: "app-gallery.html" },
      { name: "App Upload", url: "/app/upload", filename: "app-upload.html" },
      { name: "App Settings", url: "/app/settings", filename: "app-settings.html" },
    ]},
    { category: "Portal", items: [
      { name: "Uploads", url: "/portal/uploads", filename: "portal-uploads.html" },
      { name: "Gallery Upload", url: "/portal/gallery-upload", filename: "portal-gallery-upload.html" },
      { name: "Gallery Photographer", url: "/portal/gallery-photographer", filename: "portal-gallery-photographer.html" },
      { name: "Gallery Editing", url: "/portal/gallery-editing", filename: "portal-gallery-editing.html" },
    ]},
    { category: "Capture Workflow", items: [
      { name: "Capture Index", url: "/capture", filename: "capture-index.html" },
      { name: "Capture Camera", url: "/capture/camera", filename: "capture-camera.html" },
      { name: "Capture Review", url: "/capture/review", filename: "capture-review.html" },
      { name: "Capture Upload", url: "/capture/upload", filename: "capture-upload.html" },
    ]},
    { category: "Admin & Tools", items: [
      { name: "Admin Editorial", url: "/admin/editorial", filename: "admin-editorial.html" },
      { name: "Admin SEO", url: "/admin/seo", filename: "admin-seo.html" },
      { name: "AI Lab", url: "/ai-lab", filename: "ai-lab.html" },
      { name: "Demo Upload", url: "/demo-upload", filename: "demo-upload.html" },
      { name: "Demo Jobs", url: "/demo-jobs", filename: "demo-jobs.html" },
      { name: "Docs Rooms Spec", url: "/docs/rooms-spec", filename: "docs-rooms-spec.html" },
      { name: "Test Debug", url: "/test", filename: "test-debug.html" },
    ]},
    { category: "Forms & Processes", items: [
      { name: "Dashboard", url: "/dashboard", filename: "dashboard.html" },
      { name: "Gallery", url: "/gallery", filename: "gallery.html" },
      { name: "Intake", url: "/intake", filename: "intake.html" },
      { name: "Jobs", url: "/jobs", filename: "jobs.html" },
      { name: "Booking", url: "/buchen", filename: "booking.html" },
      { name: "Booking Confirmation", url: "/booking-confirmation", filename: "booking-confirmation.html" },
      { name: "Kontakt Formular", url: "/kontakt-formular", filename: "kontakt-formular.html" },
      { name: "Datenschutz", url: "/datenschutz", filename: "datenschutz.html" },
      { name: "Upload RAW", url: "/upload-raw", filename: "upload-raw.html" },
    ]},
  ];

  const totalPages = pages.reduce((sum, cat) => sum + cat.items.length, 0);

  const downloadSourceCode = () => {
    alert("Source Code Export kommt gleich...");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-lg font-bold">📸 pix.immo Export</h1>
          <p className="text-muted-foreground text-lg">
            {totalPages} Seiten • Für Figma Design Updates
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>💡 Anleitung</CardTitle>
            <CardDescription>So exportieren Sie die Seiten</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Option 1: Browser Screenshots (empfohlen)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Klicken Sie auf "Seite öffnen" neben jeder Seite</li>
                <li>Machen Sie einen Screenshot (Browser DevTools: Cmd/Ctrl+Shift+P → "Capture full size screenshot")</li>
                <li>Speichern Sie mit dem angegebenen Dateinamen (z.B. "home.html")</li>
              </ol>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Option 2: Source Code Export</h3>
              <p className="text-sm text-muted-foreground">
                Exportiert die React-Komponenten (.tsx) als ZIP
              </p>
              <Button onClick={downloadSourceCode} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Source Code exportieren
              </Button>
            </div>
          </CardContent>
        </Card>

        {pages.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
              <CardDescription>{category.items.length} Seiten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {category.items.map((page) => (
                  <div 
                    key={page.url}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{page.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {page.filename}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                      >
                        <a href={page.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Seite öffnen
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
