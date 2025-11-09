import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Footer } from "../components/Footer";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import { MapPin, Menu, Sun, Info } from "lucide-react";

type PackageType = {
  id: string;
  images: number;
  price: number;
  description: string;
  selected: boolean;
};

type AddonType = {
  id: string;
  label: string;
  price: number;
  checked: boolean;
};

export default function Booking() {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Address & Date
  const [street, setStreet] = useState("");
  const [cityPostal, setCityPostal] = useState("");
  const [floor, setFloor] = useState("");
  const [parking, setParking] = useState("");
  const [addressVerified, setAddressVerified] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availability, setAvailability] = useState<"available" | "alternative" | null>(null);
  const [sunTime, setSunTime] = useState(11.5); // 11:30 in decimal hours
  const [optimalTime, setOptimalTime] = useState("14:30");

  // Packages
  const [packages, setPackages] = useState<PackageType[]>([
    { id: "10", images: 10, price: 180, description: "bis 60 m² · Innen + Außen · +5 Auswahlbilder", selected: false },
    { id: "15", images: 15, price: 200, description: "bis 90 m² · +5 Auswahlbilder", selected: false },
    { id: "20", images: 20, price: 220, description: "Standardhäuser · +5 Auswahlbilder", selected: false },
    { id: "30", images: 30, price: 250, description: "größere Objekte · +5 Auswahlbilder", selected: false },
    { id: "40", images: 40, price: 300, description: "Villen / Gewerbe · +5 Auswahlbilder", selected: false },
  ]);

  // Addons
  const [droneAddons, setDroneAddons] = useState<AddonType[]>([
    { id: "drone-addon", label: "Add-on – 6 Luftbilder", price: 100, checked: false },
    { id: "drone-only", label: "Nur Drohne – 6 Bilder", price: 200, checked: false },
    { id: "drone-large", label: "Großes Grundstück", price: 50, checked: false },
  ]);

  const [tourAddons, setTourAddons] = useState<AddonType[]>([
    { id: "tour-basic", label: "Basis-Tour (MLS)", price: 80, checked: false },
    { id: "tour-floorplan", label: "Tour mit Grundriss", price: 150, checked: false },
    { id: "floorplan-create", label: "Grundriss erstellen", price: 40, checked: false },
  ]);

  const [aiAddons, setAiAddons] = useState<AddonType[]>([
    { id: "ai-alt", label: "Alt-Texte", price: 12, checked: false },
    { id: "ai-short", label: "Exposé kurz", price: 20, checked: false },
    { id: "ai-standard", label: "Exposé standard", price: 29, checked: false },
    { id: "ai-premium", label: "Exposé premium", price: 39, checked: false },
  ]);

  // Customer Data
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [saveData, setSaveData] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"invoice" | "card">("card");
  const [isVerifiedCustomer] = useState(false); // Wird nach erster Buchung auf true gesetzt

  // Checkboxes
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [bindingConfirmed, setBindingConfirmed] = useState(false);
  const [aiProcessingAccepted, setAiProcessingAccepted] = useState(false);

  // Booking state
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");

  const handleVerifyAddress = () => {
    if (street && cityPostal) {
      setAddressVerified(true);
      // Simulate availability check
      setTimeout(() => {
        setAvailability(Math.random() > 0.5 ? "available" : "alternative");
      }, 500);
    }
  };

  const formatSunTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSunTimeChange = (value: number[]) => {
    setSunTime(value[0]);
    // Calculate optimal time based on sun position (simplified)
    const optimal = value[0] + 3; // 3 hours after selected time
    setOptimalTime(formatSunTime(optimal));
  };

  const suggestTimeBasedOnSun = () => {
    setTime(optimalTime);
    setAvailability("available");
  };

  const handlePackageSelect = (id: string) => {
    setPackages(packages.map(pkg => ({
      ...pkg,
      selected: pkg.id === id ? !pkg.selected : false
    })));
  };

  const toggleAddon = (
    addons: AddonType[],
    setAddons: React.Dispatch<React.SetStateAction<AddonType[]>>,
    id: string
  ) => {
    setAddons(addons.map(addon => 
      addon.id === id ? { ...addon, checked: !addon.checked } : addon
    ));
  };

  const calculateTotal = () => {
    const packagePrice = packages.find(pkg => pkg.selected)?.price || 0;
    const dronePrice = droneAddons.filter(a => a.checked).reduce((sum, a) => sum + a.price, 0);
    const tourPrice = tourAddons.filter(a => a.checked).reduce((sum, a) => sum + a.price, 0);
    const aiPrice = aiAddons.filter(a => a.checked).reduce((sum, a) => sum + a.price, 0);
    const netto = packagePrice + dronePrice + tourPrice + aiPrice;
    const brutto = netto * 1.19;
    return { netto, brutto };
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (agbAccepted && privacyAccepted && gdprAccepted && bindingConfirmed && aiProcessingAccepted) {
      // Simulate booking process
      setBookingStatus("idle");
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          setBookingStatus("success");
          setTimeout(() => {
            setLocation("/booking-confirmation");
          }, 2000);
        } else {
          setBookingStatus("error");
        }
      }, 1000);
    }
  };

  const handleEdit = () => {
    // Scroll to packages section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectedPackage = packages.find(pkg => pkg.selected);
  const selectedAddons = [
    ...droneAddons.filter(a => a.checked),
    ...tourAddons.filter(a => a.checked),
    ...aiAddons.filter(a => a.checked),
  ];

  const { netto, brutto } = calculateTotal();

  return (
    <div className="min-h-screen bg-[var(--color-white)] flex flex-col">
      <SEOHead
        title="Auftrag buchen"
        description="Buchen Sie Ihr Fotopaket für professionelle Immobilienfotografie in Hamburg."
        path="/booking"
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
          
          {/* BLOCK 1 - Seitenkopf */}
          <div style={{ marginBottom: "40px" }}>
            <h1 className="text-2xl mb-2">Auftrag buchen</h1>
            <p className="text-[14px] text-[var(--color-grey)]">
              Geben Sie die Objektadresse und den gewünschten Termin an.
              Wählen Sie anschließend Ihr Fotopaket und gewünschte Zusatzleistungen.
            </p>
          </div>

          {/* BLOCK 2 - Objektadresse & Termin */}
          <div style={{ marginBottom: "40px" }}>
            <h2 className="text-2xl mb-4">Objektadresse</h2>
            
            <div className="space-y-4" style={{ marginBottom: "16px" }}>
              <Input
                placeholder="Straße und Hausnummer"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="Postleitzahl / Ort"
                value={cityPostal}
                onChange={(e) => setCityPostal(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="Etage / Hinweise (optional)"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="Parkmöglichkeit (optional)"
                value={parking}
                onChange={(e) => setParking(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
            </div>

            <button
              onClick={handleVerifyAddress}
              className="flex items-center gap-2 px-4 bg-[var(--color-white)] border border-[var(--color-grey)] hover:bg-[var(--color-light-grey)] transition-colors"
              style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
            >
              <MapPin className="w-3 h-3" />
              Adresse verifizieren
            </button>

            <p className="text-[12px] text-[#666] mt-2">
              Nach der Verifizierung erscheint eine Kartenansicht mit dem genauen Standort und dem aktuellen Sonnenstand.
            </p>

            {/* BLOCK 2 – Kartenbereich (nach Verifizierung) */}
            {addressVerified && (
              <div className="mt-6" style={{ marginBottom: "24px" }}>
                <h2 className="text-2xl mb-2">Objektstandort und Sonnenstand</h2>
                <p className="text-[14px] text-[var(--color-grey)] mb-4">
                  Nach der Adressprüfung erscheint hier eine Karte mit dem genauen Standort.
                  Über den Regler können Sie den Sonnenstand und die optimale Fotozeit prüfen.
                </p>

                {/* Map Container - 600px x 300px Placeholder */}
                <div
                  className="relative flex items-center justify-center overflow-hidden border"
                  style={{ 
                    width: "100%", 
                    maxWidth: "600px", 
                    height: "300px", 
                    borderRadius: "0px",
                    backgroundColor: "#EDEDED",
                    borderColor: "#CCCCCC",
                  }}
                >
                  {/* Map Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-[14px] text-[#999]">
                      Google Maps – Platzhalter
                    </p>
                  </div>

                  {/* Sun Position Overlay - Top Right */}
                  <div 
                    className="absolute top-2 right-2 bg-white/80 border p-2"
                    style={{ 
                      borderRadius: "0px", 
                      width: "180px",
                      borderColor: "#DDD",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px]">☀️ Sonnenstand</span>
                      <span className="text-[12px] text-[#333]">• {formatSunTime(sunTime)}</span>
                    </div>
                    
                    {/* Time Slider */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-[#666]">
                        <button
                          onClick={() => handleSunTimeChange([Math.max(8, sunTime - 0.5)])}
                          className="hover:text-[var(--color-black)] px-1"
                        >
                          ◀
                        </button>
                        <span className="text-[11px]">Regler: 08:00 – 20:00</span>
                        <button
                          onClick={() => handleSunTimeChange([Math.min(20, sunTime + 0.5)])}
                          className="hover:text-[var(--color-black)] px-1"
                        >
                          ▶
                        </button>
                      </div>
                      
                      <Slider
                        value={[sunTime]}
                        onValueChange={handleSunTimeChange}
                        min={8}
                        max={20}
                        step={0.25}
                        className="w-full"
                      />
                      
                      <p className="text-[10px] text-[#333] mt-1">
                        Optimale Belichtung: {optimalTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Weather Hint */}
                <p className="text-[12px] text-[#777] mt-3 italic">
                  ☁️ Der tatsächliche Sonnenstand kann wetterbedingt abweichen.
                </p>

                {/* Suggest Time Button */}
                <button
                  onClick={suggestTimeBasedOnSun}
                  className="mt-4 px-4 bg-[var(--color-black)] text-white hover:bg-[var(--color-grey)] transition-colors"
                  style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
                >
                  Termin basierend auf Sonnenstand vorschlagen
                </button>

                {/* Data Usage Notice */}
                <p className="text-[12px] text-[#777] mt-3">
                  Die Kartenansicht nutzt Google Maps und Google Places API.
                  Es werden keine personenbezogenen Daten gespeichert, sondern nur die Adresse zur Terminermittlung verarbeitet.
                </p>
              </div>
            )}

            {/* Termin */}
            <div className="mt-8">
              <h2 className="text-2xl mb-4">Termin</h2>
              
              <div className="space-y-4">
                <Input
                  type="date"
                  placeholder="Datum"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ height: "32px", borderRadius: "0px" }}
                />
                <Input
                  type="time"
                  placeholder="Uhrzeit"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  step="900"
                  style={{ height: "32px", borderRadius: "0px" }}
                />
              </div>

              {availability === "available" && (
                <p className="text-[14px] text-green-700 mt-2">✅ Termin ist verfügbar</p>
              )}
              {availability === "alternative" && (
                <p className="text-[14px] text-yellow-700 mt-2">⚠️ Alternativvorschlag: 13:45 Uhr</p>
              )}
            </div>
          </div>

          {/* BLOCK 3 - Fotopakete */}
          <div style={{ marginBottom: "40px" }}>
            <h2 className="text-2xl mb-4">Wählen Sie Ihr Fotopaket</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => handlePackageSelect(pkg.id)}
                  className={`p-4 border cursor-pointer transition-colors ${
                    pkg.selected 
                      ? 'border-[var(--color-black)] bg-[var(--color-light-grey)]' 
                      : 'border-[var(--color-grey)] hover:border-[var(--color-black)]'
                  }`}
                  style={{ borderRadius: "0px" }}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[14px]">{pkg.images} Bilder</span>
                    <span className="text-[14px]">{pkg.price} €</span>
                  </div>
                  <p className="text-[12px] text-[var(--color-grey)]">{pkg.description}</p>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-[#666] mt-4">
              In jedem Paket sind fünf zusätzliche Aufnahmen zur Auswahl enthalten.
              Nicht gewählte Motive können nachbestellt werden (10 €/Bild).
            </p>
          </div>

          {/* BLOCK 4 - Zusatzleistungen */}
          <div style={{ marginBottom: "40px" }}>
            <h2 className="text-2xl mb-4">Zusätzliche Medien & Optionen</h2>
            
            {/* Drohnenaufnahmen */}
            <div className="mb-6">
              <h3 className="text-[14px] mb-2">Drohnenaufnahmen</h3>
              <div className="space-y-2">
                {droneAddons.map(addon => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Checkbox
                      id={addon.id}
                      checked={addon.checked}
                      onCheckedChange={() => toggleAddon(droneAddons, setDroneAddons, addon.id)}
                    />
                    <label htmlFor={addon.id} className="text-[14px] cursor-pointer">
                      {addon.label} · {addon.price} €
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 360°-Touren */}
            <div className="mb-6">
              <h3 className="text-[14px] mb-2">360°-Touren</h3>
              <div className="space-y-2">
                {tourAddons.map(addon => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Checkbox
                      id={addon.id}
                      checked={addon.checked}
                      onCheckedChange={() => toggleAddon(tourAddons, setTourAddons, addon.id)}
                    />
                    <label htmlFor={addon.id} className="text-[14px] cursor-pointer">
                      {addon.label} · {addon.price} €
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* KI-Texte & Exposé */}
            <div>
              <h3 className="text-[14px] mb-2">KI-Texte & Exposé</h3>
              <div className="space-y-2">
                {aiAddons.map(addon => (
                  <div key={addon.id} className="flex items-center gap-2">
                    <Checkbox
                      id={addon.id}
                      checked={addon.checked}
                      onCheckedChange={() => toggleAddon(aiAddons, setAiAddons, addon.id)}
                    />
                    <label htmlFor={addon.id} className="text-[14px] cursor-pointer">
                      {addon.label} · {addon.price} €
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BLOCK 5 - Kundendaten */}
          <div style={{ marginBottom: "40px" }}>
            <h2 className="text-2xl mb-4">Kundendaten</h2>
            
            <div className="space-y-4">
              <Input
                placeholder="Name / Firma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="Telefonnummer"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="E-Mail-Adresse"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
              <Input
                placeholder="Rechnungsadresse"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                style={{ height: "32px", borderRadius: "0px" }}
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox
                id="saveData"
                checked={saveData}
                onCheckedChange={(checked) => setSaveData(checked as boolean)}
              />
              <label htmlFor="saveData" className="text-[14px] cursor-pointer">
                Daten für künftige Buchungen merken
              </label>
            </div>
          </div>

          {/* BLOCK 6 - Zusammenfassung & Buchung */}
          <div style={{ marginBottom: "40px" }}>
            <h2 className="text-2xl mb-2">Zusammenfassung Ihrer Buchung</h2>
            <p className="text-[14px] text-[var(--color-grey)] mb-6">
              Bitte prüfen Sie Ihre Angaben und bestätigen Sie die Buchung.
              Nach Absenden erhalten Sie eine Bestätigung per E-Mail und den Termin im Kalender (.ics).
            </p>

            {/* Status Banners */}
            {bookingStatus === "success" && (
              <div
                className="px-4 py-3 text-[14px] mb-4"
                style={{
                  backgroundColor: "#E6F4EA",
                  color: "#1B5E20",
                  borderRadius: "0px",
                }}
              >
                ✅ Buchung erfolgreich!<br />
                <span className="text-[12px]">
                  Sie erhalten in Kürze eine Bestätigung mit allen Details per E-Mail.
                  Ihr Termin wurde im Kalender eingetragen.
                </span>
              </div>
            )}

            {bookingStatus === "error" && (
              <div
                className="px-4 py-3 text-[14px] mb-4"
                style={{
                  backgroundColor: "#FDECEA",
                  color: "#B71C1C",
                  borderRadius: "0px",
                }}
              >
                ⚠️ Fehler beim Absenden.<br />
                <span className="text-[12px]">
                  Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.
                </span>
              </div>
            )}

            {/* Buchungsdetails Table */}
            <div className="space-y-2 mb-6 text-[14px]">
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Adresse:</span>
                <span className="text-right">{street || "—"}, {cityPostal || "—"}</span>
              </div>
              
              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Datum / Uhrzeit:</span>
                <span>{date || "—"} {time && `${time} Uhr`}</span>
              </div>

              {selectedPackage && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">Fotopaket:</span>
                  <span>{selectedPackage.images} Bilder – {selectedPackage.price} €</span>
                </div>
              )}

              {droneAddons.some(a => a.checked) && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">Drohnenaufnahmen:</span>
                  <span>
                    {droneAddons.filter(a => a.checked).map(a => `${a.label} – ${a.price} €`).join(", ")}
                  </span>
                </div>
              )}

              {tourAddons.some(a => a.checked) && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">360°-Touren:</span>
                  <span>
                    {tourAddons.filter(a => a.checked).map(a => `${a.label} – ${a.price} €`).join(", ")}
                  </span>
                </div>
              )}

              {aiAddons.some(a => a.checked) && (
                <div className="flex justify-between py-1">
                  <span className="text-[var(--color-grey)]">KI-Texte & Exposé:</span>
                  <span>
                    {aiAddons.filter(a => a.checked).map(a => `${a.label} – ${a.price} €`).join(", ")}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Fahrtkosten:</span>
                <span>0,60 €/km ab 20 km</span>
              </div>

              <div className="border-t border-[var(--color-light-grey)] my-2"></div>

              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">Gesamtbetrag (netto):</span>
                <span>{netto.toFixed(2)} €</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-[var(--color-grey)]">zzgl. MwSt 19 %:</span>
                <span>{(brutto - netto).toFixed(2)} €</span>
              </div>

              <div className="flex justify-between py-1">
                <span>Gesamtbetrag (brutto):</span>
                <span>{brutto.toFixed(2)} €</span>
              </div>
            </div>

            {/* Zahlungsart */}
            <div className="mb-6" style={{ marginTop: "24px" }}>
              <h3 className="text-[14px] mb-3">Zahlungsart</h3>
              
              <p className="text-[12px] text-[#666] mb-4">
                Bitte wählen Sie Ihre bevorzugte Zahlungsart. Neukunden werden vor der ersten Auftragsbestätigung kurz überprüft, um reibungslose Abläufe sicherzustellen.
              </p>
              
              <div className="space-y-4">
                {/* Option 1: Kredit- oder Debitkarte */}
                <div className="border border-[var(--color-light-grey)] p-4" style={{ borderRadius: "0px" }}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="payment-card"
                      checked={paymentMethod === "card"}
                      onCheckedChange={(checked) => checked && setPaymentMethod("card")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label htmlFor="payment-card" className="text-[14px] cursor-pointer">
                          Kredit- oder Debitkarte
                        </label>
                        <span className="px-2 py-0.5 bg-[#64BF49] text-white text-[10px]" style={{ borderRadius: "0px" }}>
                          Empfohlen
                        </span>
                        <div className="group relative">
                          <Info className="w-3.5 h-3.5 text-[var(--color-grey)] cursor-help" />
                          <div className="absolute left-0 top-5 w-64 p-2 bg-white border border-[var(--color-grey)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10" style={{ borderRadius: "0px" }}>
                            <p className="text-[11px]">Sicher über Stripe – unterstützt Apple Pay und Google Pay.</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#666]">
                        Der Betrag wird nur reserviert und erst nach Fertigstellung abgebucht.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Option 2: Rechnung nach Fertigstellung */}
                <div 
                  className={`border p-4 ${!isVerifiedCustomer ? 'bg-[#F5F5F5] border-[#DDD]' : 'border-[var(--color-light-grey)]'}`}
                  style={{ borderRadius: "0px" }}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="payment-invoice"
                      checked={paymentMethod === "invoice"}
                      onCheckedChange={(checked) => checked && isVerifiedCustomer && setPaymentMethod("invoice")}
                      disabled={!isVerifiedCustomer}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <label 
                          htmlFor="payment-invoice" 
                          className={`text-[14px] ${isVerifiedCustomer ? 'cursor-pointer' : 'cursor-not-allowed text-[#999]'}`}
                        >
                          Rechnung nach Fertigstellung
                        </label>
                        <span className="px-2 py-0.5 bg-[#999] text-white text-[10px]" style={{ borderRadius: "0px" }}>
                          Nur nach Freischaltung
                        </span>
                        <div className="group relative">
                          <Info className="w-3.5 h-3.5 text-[var(--color-grey)] cursor-help" />
                          <div className="absolute left-0 top-5 w-64 p-2 bg-white border border-[var(--color-grey)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10" style={{ borderRadius: "0px" }}>
                            <p className="text-[11px]">
                              {isVerifiedCustomer 
                                ? "Diese Option wird nach erfolgreicher Erstbuchung dauerhaft freigeschaltet."
                                : "Diese Zahlungsart steht nach der ersten abgeschlossenen Buchung automatisch zur Verfügung."
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className={`text-[12px] ${!isVerifiedCustomer ? 'text-[#999]' : 'text-[#666]'}`}>
                        Verfügbar nach einmaliger Prüfung durch das pix.immo-Team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[12px] text-[#666] mt-4">
                Rechnungen werden automatisch nach Auftragsabschluss per E-Mail versendet.
                Zahlungsziel: 7 Tage netto.
              </p>
            </div>

            {/* Rechtliches */}
            <div className="mb-6" style={{ marginTop: "24px" }}>
              <h3 className="text-[14px] mb-3">Rechtliches</h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agb"
                    checked={agbAccepted}
                    onCheckedChange={(checked) => setAgbAccepted(checked as boolean)}
                  />
                  <label htmlFor="agb" className="text-[14px] cursor-pointer">
                    Ich akzeptiere die{" "}
                    <Link href="/agb">
                      <span className="underline">AGB</span>
                    </Link>
                    {" "}und{" "}
                    <Link href="/datenschutz">
                      <span className="underline">Datenschutz-Bestimmungen</span>
                    </Link>
                    .
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="binding"
                    checked={bindingConfirmed}
                    onCheckedChange={(checked) => setBindingConfirmed(checked as boolean)}
                  />
                  <label htmlFor="binding" className="text-[14px] cursor-pointer">
                    Ich bestätige, dass der Auftrag verbindlich erteilt wird.
                  </label>
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="ai-processing"
                    checked={aiProcessingAccepted}
                    onCheckedChange={(checked) => setAiProcessingAccepted(checked as boolean)}
                  />
                  <label htmlFor="ai-processing" className="text-[14px] cursor-pointer">
                    Ich stimme der anonymisierten Verarbeitung meiner Bilder zur KI-gestützten Texterstellung zu.
                  </label>
                </div>
              </div>

              <p className="text-[12px] text-[#777] mt-2">
                Alle Daten werden verschlüsselt übertragen und ausschließlich zur Auftragsabwicklung verwendet.
              </p>
            </div>

            {/* Buttons */}
            <form onSubmit={handleBooking}>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex-1 bg-[var(--color-white)] border border-[var(--color-grey)] text-[var(--color-black)] hover:bg-[var(--color-light-grey)] transition-colors"
                  style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
                >
                  Änderungen vornehmen
                </button>
                
                <button
                  type="submit"
                  disabled={!agbAccepted || !bindingConfirmed || !aiProcessingAccepted || bookingStatus === "success"}
                  className="flex-1 bg-[var(--color-black)] text-white hover:bg-[var(--color-grey)] disabled:bg-[var(--color-light-grey)] disabled:text-[var(--color-grey)] transition-colors"
                  style={{ height: "24px", borderRadius: "0px", fontSize: "12px" }}
                >
                  Verbindlich buchen
                </button>
              </div>
            </form>
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
