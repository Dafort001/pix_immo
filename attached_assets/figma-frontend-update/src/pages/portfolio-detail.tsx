import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Button } from "../components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { portfolioImages } from "../data/portfolio-images";

export default function PortfolioDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const imageId = params.id;

  const currentIndex = portfolioImages.findIndex((img) => img.id === imageId);
  const currentImage = portfolioImages[currentIndex];

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [imageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setLocation(`/portfolio/${portfolioImages[currentIndex - 1].id}`);
      } else if (e.key === "ArrowRight" && currentIndex < portfolioImages.length - 1) {
        setLocation(`/portfolio/${portfolioImages[currentIndex + 1].id}`);
      } else if (e.key === "Escape") {
        setLocation("/portfolio");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, setLocation]);

  if (!currentImage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Bild nicht gefunden</h1>
          <Link href="/portfolio">
            <Button>Zurück zum Portfolio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getColorForImage = (id: string): string => {
    const accentColors = ["#64E649", "#74A4EA", "#C94B38", "#D8B95A", "#D87098", "#CB8C48"];
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return accentColors[hash % accentColors.length];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={currentImage.alt}
        description={`Portfolio - ${currentImage.alt}`}
        path={`/portfolio/${imageId}`}
      />

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xl font-semibold tracking-tight cursor-pointer">PIX.IMMO</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/portfolio">
                <Button variant="ghost" size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Schließen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="relative w-full max-w-7xl">
          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setLocation(`/portfolio/${portfolioImages[currentIndex - 1].id}`)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {currentIndex < portfolioImages.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
              onClick={() => setLocation(`/portfolio/${portfolioImages[currentIndex + 1].id}`)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Image Container */}
          <div className="relative w-full flex items-center justify-center">
            {/* Placeholder */}
            {!imageLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundColor: getColorForImage(currentImage.id),
                  aspectRatio:
                    currentImage.aspectRatio === "3:2"
                      ? "3/2"
                      : currentImage.aspectRatio === "2:3"
                      ? "2/3"
                      : currentImage.aspectRatio === "16:9"
                      ? "16/9"
                      : currentImage.aspectRatio === "9:16"
                      ? "9/16"
                      : "1/1",
                }}
              >
                <span className="text-white text-lg px-8 text-center">{currentImage.alt}</span>
              </div>
            )}

            {/* Image */}
            <img
              src={currentImage.url}
              alt={currentImage.alt}
              className={`max-w-full max-h-[80vh] w-auto h-auto object-contain transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Image Info */}
          <div className="mt-6 text-center">
            <p className="text-lg mb-2">{currentImage.alt}</p>
            <p className="text-sm text-muted-foreground">
              {currentIndex + 1} / {portfolioImages.length}
            </p>
          </div>
        </div>
      </section>

      <div className="flex-grow"></div>

      <Footer />
    </div>
  );
}
