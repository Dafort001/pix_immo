import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Checkbox } from "../components/ui/checkbox";

export default function Register() {
  const [, setLocation] = useLocation();
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCity, setPostalCity] = useState("");
  const [taxId, setTaxId] = useState("");
  
  // Checkboxes
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedDataProcessing, setAcceptedDataProcessing] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!acceptedTerms || !acceptedPrivacy) {
      return; // Show error message in real implementation
    }
    
    // Navigate to verification page
    setLocation("/register-verify");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <SEOHead
        title="Neues Kundenkonto erstellen"
        description="Registrieren Sie sich für professionelle Immobilienfotografie."
        path="/register"
      />

      {/* Registration Modal */}
      <div
        className="bg-white shadow-2xl"
        style={{
          width: "400px",
          padding: "24px",
          borderRadius: "0px",
        }}
      >
        {/* Title and Subline */}
        <div className="text-center" style={{ marginBottom: "16px" }}>
          <h1 className="text-2xl mb-2">Neues Kundenkonto erstellen</h1>
          <p className="text-sm text-muted-foreground">
            Registrieren Sie sich, um Aufträge zu buchen, Rechnungen einzusehen<br />
            und Ihre Galerien online zu verwalten.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister}>
          {/* Vorname */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="firstName"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Vorname
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Max"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Nachname */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="lastName"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Nachname
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Mustermann"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Firmenname (optional) */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="company"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Firmenname (optional)
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Muster Immobilien GmbH"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* E-Mail-Adresse */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mail@firma.de"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Telefonnummer */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="phone"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Telefonnummer
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+49 171 1234567"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Rechnungsadresse */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="address"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Rechnungsadresse
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straße und Hausnummer"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Postleitzahl / Ort */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="postalCity"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Postleitzahl / Ort
            </label>
            <input
              id="postalCity"
              type="text"
              value={postalCity}
              onChange={(e) => setPostalCity(e.target.value)}
              placeholder="22765 Hamburg"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Umsatzsteuer-ID (optional) */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="taxId"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Umsatzsteuer-ID (optional)
            </label>
            <input
              id="taxId"
              type="text"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="DE123456789"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Checkboxes */}
          <div style={{ marginBottom: "16px" }} className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                required
              />
              <label
                htmlFor="terms"
                className="text-xs cursor-pointer leading-tight"
                style={{ fontSize: "12px" }}
              >
                AGB akzeptiert
              </label>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                required
              />
              <label
                htmlFor="privacy"
                className="text-xs cursor-pointer leading-tight"
                style={{ fontSize: "12px" }}
              >
                Datenschutz gelesen
              </label>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataProcessing"
                checked={acceptedDataProcessing}
                onCheckedChange={(checked) => setAcceptedDataProcessing(checked as boolean)}
              />
              <label
                htmlFor="dataProcessing"
                className="text-xs cursor-pointer leading-tight"
                style={{ fontSize: "12px", lineHeight: "1.4" }}
              >
                Ich stimme zu, dass meine Bild- und Auftragsdaten ggf. auf Servern außerhalb der EU verarbeitet werden dürfen (anonymisierte Daten, DSGVO-konform).
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2" style={{ marginBottom: "16px" }}>
            {/* Primary Button - Konto erstellen */}
            <button
              type="submit"
              disabled={!acceptedTerms || !acceptedPrivacy}
              className="w-full text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#2E2E2E",
                height: "24px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "0px",
              }}
            >
              Konto erstellen
            </button>

            {/* Secondary Button - Zurück zum Login */}
            <Link href="/login">
              <button
                type="button"
                className="w-full bg-transparent border transition-colors hover:bg-muted/50"
                style={{
                  borderColor: "#D0D0D0",
                  color: "#222222",
                  height: "24px",
                  fontSize: "12px",
                  fontWeight: 500,
                  borderRadius: "0px",
                }}
              >
                Zurück zum Login
              </button>
            </Link>
          </div>

          {/* Info Text */}
          <div className="text-center">
            <p className="text-xs leading-relaxed" style={{ color: "#666", fontSize: "11px", lineHeight: "1.6" }}>
              Nach der Registrierung erhalten Sie einen einmaligen Bestätigungscode<br />
              per E-Mail. Bitte geben Sie diesen Code ein, um Ihr Konto zu aktivieren.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
