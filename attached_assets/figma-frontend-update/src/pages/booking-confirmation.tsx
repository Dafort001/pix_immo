import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Menu, Calendar, Home } from "lucide-react";

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Mock booking data - in production this would come from state/API
  const bookingData = {
    address: "Elbchaussee 123, 22763 Hamburg",
    date: "15.04.2025",
    time: "14:30 – 16:00 Uhr",
    package: "20 Bilder – 220 €",
    addons: ["Drohne 6 Bilder – 100 €", "360° Basis-Tour – 80 €"],
    aiServices: "Exposé Standard – 29 €",
    total: "510,51 €",
  };

  return (
    <div className="min-h-screen bg-[var(--color-white)] flex flex-col">
      <SEOHead
        title="Buchung bestätigt"
        description="Ihre Buchung wurde erfolgreich bestätigt."
        path="/booking-confirmation"
      />

      {/* Header */}
      <header className="border-b border-[var(--color-light-grey)]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl tracking-[-0.02em] cursor-pointer">PIX.IMMO</span>
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-[var(--color-light-grey)] transition-colors"
            style={{ borderRadius: "0px" }}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="max-w-[800px] mx-auto px-8">
          
          {/* BLOCK 1 – Bestätigungskopf */}
          <div
            className="px-4 py-3 text-[14px] mb-8 text-center"
            style={{
              backgroundColor: "#E6F4EA",
              color: "#1B5E20",
              borderRadius: "0px",
            }}
          >
            ✅ Buchung erfolgreich
          </div>

          <div className="text-center" style={{ marginBottom: "32px" }}>
            <h1 className="text-2xl mb-2">Vielen Dank für Ihre Buchung</h1>
            <p className="text-[14px] text-[var(--color-grey)]">
              Ihr Auftrag wurde erfolgreich übermittelt.
              Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details und einem Kalender-Eintrag (.ics).
            </p>
          </div>

          {/* BLOCK 2 – Buchungsübersicht */}
          <div style={{ marginBottom: "32px" }}>
            <h2 className="text-2xl mb-4">Zusammenfassung Ihres Auftrags</h2>
            
            <div className="space-y-2 text-[14px]">
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Adresse:</span>
                <span className="text-right">{bookingData.address}</span>
              </div>
              
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Datum / Uhrzeit:</span>
                <span>{bookingData.date}, {bookingData.time}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Fotopaket:</span>
                <span>{bookingData.package}</span>
              </div>

              {bookingData.addons.length > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">Zusatzleistungen:</span>
                  <span className="text-right">
                    {bookingData.addons.map((addon, i) => (
                      <span key={i}>
                        {addon}
                        {i < bookingData.addons.length - 1 && <br />}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              {bookingData.aiServices && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">KI-Texte & Exposé:</span>
                  <span>{bookingData.aiServices}</span>
                </div>
              )}

              <div className="border-t border-[var(--color-light-grey)] my-2"></div>

              <div className="flex justify-between py-1">
                <span>Gesamtbetrag (brutto):</span>
                <span>{bookingData.total}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#777] mt-4">
              Alle Preise verstehen sich inkl. MwSt. und Fahrtkosten innerhalb Hamburgs.
            </p>
          </div>

          {/* BLOCK 3 – Nächste Schritte */}
          <div style={{ marginBottom: "32px" }}>
            <h2 className="text-2xl mb-4">Was passiert als Nächstes?</h2>
            
            <div className="space-y-3 text-[14px]">
              <p>1️⃣ Ihr Termin wurde in den Kalender eingetragen.</p>
              <p>2️⃣ Sie erhalten eine E-Mail mit allen Details.</p>
              <p>3️⃣ Nach dem Shooting werden Sie benachrichtigt, sobald Ihre Galerie bereitsteht.</p>
            </div>

            <p className="text-[12px] text-[#666] mt-4 italic">
              Tipp: Über Ihr Kundenkonto können Sie Termine, Rechnungen und Galerien jederzeit einsehen.
            </p>
          </div>

          {/* BLOCK 4 – Aktionen */}
          <div className="flex gap-2">
            <button
              onClick={() => setLocation("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-black)] text-white hover:bg-[var(--color-grey)] transition-colors"
              style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
            >
              <Calendar className="w-3 h-3" />
              Zu meinen Aufträgen
            </button>

            <button
              onClick={() => setLocation("/")}
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-white)] border border-[var(--color-grey)] text-[var(--color-black)] hover:bg-[var(--color-light-grey)] transition-colors"
              style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
            >
              <Home className="w-3 h-3" />
              Zur Startseite
            </button>
          </div>

        </div>
      </main>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <Footer />
    </div>
  );
}
