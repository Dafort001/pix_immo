import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";

export default function LoginOTPRequest() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [, setLocation] = useLocation();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email) {
      // Navigate to verification page
      setLocation("/login-otp-verify");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead
        title="Einmaliger Login-Code"
        description="Fordern Sie einen einmaligen Login-Code per E-Mail oder SMS an."
        path="/login-otp-request"
      />

      {/* Login Modal */}
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
          <h1 className="text-2xl mb-2">Einmaliger Login-Code</h1>
          <p className="text-sm text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse und – falls vorhanden – Ihre Mobilnummer ein.<br />
            Wir senden Ihnen anschließend einen einmaligen Code zum Einloggen.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSendCode}>
          {/* Email Input */}
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
              placeholder="mail@beispiel.de"
              className="w-full border border-border px-3 bg-background"
              style={{
                height: "32px",
                borderRadius: "0px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {/* Phone Input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="phone"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Telefonnummer (optional)
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
            />
          </div>

          {/* Buttons */}
          <div className="space-y-2" style={{ marginBottom: "16px" }}>
            {/* Primary Button - Login-Code senden */}
            <button
              type="submit"
              className="w-full text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#2E2E2E",
                height: "24px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "0px",
              }}
            >
              Login-Code senden
            </button>

            {/* Secondary Button - Zurück zum Passwort-Login */}
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
                Zurück zum Passwort-Login
              </button>
            </Link>
          </div>

          {/* Info Text */}
          <div className="text-center">
            <p className="text-xs leading-relaxed" style={{ color: "#666", fontSize: "11px", lineHeight: "1.6" }}>
              🔒 Ihre Daten werden ausschließlich zum Versand des Login-Codes verwendet.<br />
              Der Code ist nur wenige Minuten gültig und ersetzt Ihr Passwort für diesen Login.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
