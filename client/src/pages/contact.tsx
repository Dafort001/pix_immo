import { Mail, Phone } from "lucide-react";
import { SEOHead } from "@shared/components";
import { SimplePageHeader } from "@/components/SimplePageHeader";

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Kontakt"
        description="Kontaktieren Sie PIX.IMMO in Hamburg. Professionelle Immobilienfotografie mit schneller Buchung und persönlichem Service."
        path="/kontakt"
      />
      <SimplePageHeader />

      {/* Content */}
      <div className="py-12 md:py-20">
        <div className="w-full max-w-4xl mx-auto px-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="page-title">Kontakt</h1>
          <p className="text-lg text-gray-600 mb-12">
            Sie erreichen uns direkt in Hamburg.
          </p>

          <div className="max-w-lg mb-12">
            {/* Hamburg */}
            <div className="bg-gray-50 p-8 rounded-lg" data-testid="contact-hamburg">
              <h2 className="text-2xl font-semibold mb-4">Hamburg</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-2">Daniel Fortmann</p>
                  <p className="text-gray-700">
                    Kaiser-Wilhelm-Straße 47<br />
                    20355 Hamburg<br />
                    Deutschland
                  </p>
                </div>
                <div className="space-y-2">
                  <a
                    href="mailto:mail@pix.immo"
                    className="flex items-center gap-2 text-primary hover:underline"
                    data-testid="email-hamburg"
                  >
                    <Mail className="h-4 w-4" />
                    mail@pix.immo
                  </a>
                  <a
                    href="tel:+491724307071"
                    className="flex items-center gap-2 text-primary hover:underline"
                    data-testid="phone-hamburg"
                  >
                    <Phone className="h-4 w-4" />
                    +49 172 430 7071
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              pix.immo ist ein Angebot von Daniel Fortmann, Kaiser-Wilhelm-Straße 47, 20355 Hamburg.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              © 2022–2025 Daniel Fortmann – Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
