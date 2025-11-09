import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl mb-2">404</h1>
          <h2 className="text-xl mb-4">Seite nicht gefunden</h2>
          <p className="text-muted-foreground mb-6">
            Die angeforderte Seite konnte nicht gefunden werden.
          </p>
          <Link href="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Zur Startseite
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
