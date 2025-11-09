import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Briefcase, Calendar, Image, LogOut, Settings, Upload, Inbox } from "lucide-react";
import { AppQuickAccessBanner } from "../components/AppQuickAccessBanner";

export default function Dashboard() {
  return (
    <>
      <AppQuickAccessBanner />
      <div className="min-h-screen bg-background pt-20">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">PIX.IMMO</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/jobs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Briefcase className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Meine Aufträge</h2>
              <p className="text-sm text-muted-foreground">Übersicht aller Projekte</p>
            </Card>
          </Link>

          <Link href="/booking">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Calendar className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Neuer Termin</h2>
              <p className="text-sm text-muted-foreground">Shooting buchen</p>
            </Card>
          </Link>

          <Link href="/galerie">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Image className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Galerie</h2>
              <p className="text-sm text-muted-foreground">Ihre Bilder ansehen</p>
            </Card>
          </Link>

          <Link href="/upload-editing-team">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Upload className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Upload → Editing Team</h2>
              <p className="text-sm text-muted-foreground">Bilder für Bearbeitung hochladen</p>
            </Card>
          </Link>

          <Link href="/eingegangene-uploads">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Inbox className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Eingegangene Uploads</h2>
              <p className="text-sm text-muted-foreground">Uploads verwalten & freigeben</p>
            </Card>
          </Link>

          <Link href="/pixcapture">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Upload className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">pixcapture.app Demo</h2>
              <p className="text-sm text-muted-foreground">iPhone Upload-Interface</p>
            </Card>
          </Link>

          <Link href="/admin-dashboard">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Briefcase className="h-10 w-10 mb-4 text-primary" />
              <h2 className="text-xl mb-2">Admin Dashboard</h2>
              <p className="text-sm text-muted-foreground">Auftragsverwaltung & Workflow</p>
            </Card>
          </Link>
        </div>
      </div>
      </div>
    </>
  );
}
