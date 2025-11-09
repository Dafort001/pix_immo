import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { Checkbox } from "../components/ui/checkbox";

type MessageState = {
  type: "success" | "error" | null;
  text: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [message, setMessage] = useState<MessageState>({ type: null, text: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login logic
    if (email && password) {
      setMessage({
        type: "success",
        text: "Anmeldung erfolgreich – willkommen zurück, Max!",
      });
      // Redirect to dashboard after successful login
      setTimeout(() => setLocation("/dashboard"), 1000);
    } else {
      setMessage({
        type: "error",
        text: "Anmeldung fehlgeschlagen – bitte prüfen Sie Ihre Zugangsdaten.",
      });
    }
  };

  const handleSendOTP = () => {
    if (email) {
      setOtpSent(true);
      setTimeout(() => setOtpSent(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead
        title="Login"
        description="Melden Sie sich an, um Ihre Aufträge, Galerien und Rechnungen einzusehen."
        path="/login"
      />

      {/* OTP Toast */}
      {otpSent && (
        <div
          className="fixed top-4 right-4 px-4 py-3 text-sm shadow-lg z-50"
          style={{
            backgroundColor: "#EEE",
            color: "#444",
            borderRadius: "0px",
          }}
        >
          Einmalcode wurde an Ihre E-Mail gesendet.
        </div>
      )}

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
          <h1 className="text-2xl mb-2">Willkommen bei PIX.IMMO</h1>
          <p className="text-sm text-muted-foreground">
            Melden Sie sich an, um Ihre Aufträge, Galerien und Rechnungen einzusehen.
          </p>
        </div>

        {/* Message Banner */}
        {message.type && (
          <div
            className="px-4 py-3 text-sm mb-4"
            style={{
              backgroundColor: message.type === "success" ? "#E6F4EA" : "#FDECEA",
              color: message.type === "success" ? "#1B5E20" : "#B71C1C",
              borderRadius: "0px",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="email"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              E-Mail-Adresse oder Name
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
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="password"
              className="block text-sm mb-2"
              style={{ fontSize: "14px" }}
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberDevice}
                onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-xs cursor-pointer"
                style={{ fontSize: "12px" }}
              >
                Gerät merken (30 Tage)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={newsletter}
                onCheckedChange={(checked) => setNewsletter(checked as boolean)}
              />
              <label
                htmlFor="newsletter"
                className="text-xs cursor-pointer"
                style={{ fontSize: "12px" }}
              >
                Newsletter über neue Blog-Beiträge erhalten
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            {/* Primary Button - Anmelden */}
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
              Anmelden
            </button>

            {/* Secondary Button - Code senden (OTP) */}
            <Link href="/login-otp-request">
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
                title="Kein Passwort nötig – Code kommt per E-Mail oder SMS."
              >
                Einmaligen Code anfordern
              </button>
            </Link>

            {/* OTP Explanation */}
            <div className="text-center" style={{ marginTop: "10px", marginBottom: "12px" }}>
              <p className="text-xs leading-relaxed" style={{ color: "#666", fontSize: "11px", lineHeight: "1.5" }}>
                💡 Alternativ können Sie sich auch ohne Passwort anmelden.<br />
                Wir senden Ihnen dazu einen einmaligen Login-Code per E-Mail oder SMS.<br />
                Dieser Code ist nur wenige Minuten gültig und ersetzt Ihr Passwort für den aktuellen Login.
              </p>
            </div>

            {/* Text Links */}
            <div className="text-center space-y-1 pt-2">
              <Link href="/login-otp-request">
                <span
                  className="block text-xs hover:underline cursor-pointer"
                  style={{ color: "#666666", fontSize: "12px" }}
                >
                  Passwort vergessen?
                </span>
              </Link>
              <Link href="/register">
                <span
                  className="block text-xs hover:underline cursor-pointer"
                  style={{ color: "#666666", fontSize: "12px" }}
                >
                  Ich bin Neukunde
                </span>
              </Link>
            </div>
          </div>
        </form>

        {/* Footnote */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: "#777", fontSize: "11px" }}>
            Ihre Daten werden verschlüsselt übertragen und ausschließlich für den Login bzw.
            Newsletter-Versand verwendet.
          </p>
        </div>
      </div>
    </div>
  );
}
