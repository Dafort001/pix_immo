import { Link } from "wouter";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function OrderForm() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/"><span className="text-xl font-semibold tracking-tight cursor-pointer">PIX.IMMO</span></Link>
            <Link href="/dashboard"><Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" />Dashboard</Button></Link>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl mb-8">Bestellformular</h1>
        <Card className="p-12 text-center"><p className="text-muted-foreground">Bestellformular</p></Card>
      </div>
    </div>
  );
}
