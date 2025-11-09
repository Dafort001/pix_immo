import { Link } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PortfolioMasonry } from "../components/PortfolioMasonry";
import { portfolioImages } from "../data/portfolio-images";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Portfolio"
        description="Unsere Referenzen - Professionelle Immobilienfotografie von PIX.IMMO"
        path="/portfolio"
      />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">PIX.IMMO</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-2xl mb-8">portfolio</h1>
            </div>

            <PortfolioMasonry images={portfolioImages} />
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
