import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SEOHead } from "../components/SEOHead";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../components/ui/input-otp";

type MessageState = {
  type: "success" | "error" | null;
  text: string;
};

export default function RegisterVerify() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<MessageState>({ type: null, text: "" });
  const [, setLocation] = useLocation();
  const recipientEmail = "mail@firma.de"; // This would come from previous page state

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length === 6) {
      // Mock verification - simulate success or error
      if (code === "123456") {
        setMessage({
          type: "success",
          text: "Konto erfolgreich aktiviert – willkommen bei PIX.IMMO!",
        });
        setTimeout(() => setLocation("/dashboard"), 1500);
      } else {
        setMessage({
          type: "error",
          text: "Ungültiger oder abgelaufener Code. Bitte erneut versuchen.",
        });
      }
    }
  };

  const handleResendCode = () => {
    setMessage({ type: null, text: "" });
    setCode("");
    // Show toast or feedback that code was resent
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SEOHead
        title="Konto aktivieren"
        description="Geben Sie den 6-stelligen Bestätigungscode ein."
        path="/register-verify"
      />

      {/* Verification Modal */}
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
          <h1 className="text-2xl mb-2">Konto aktivieren</h1>
          <p className="text-sm text-muted-foreground">
            Wir haben Ihnen einen 6-stelligen Code an <strong>{recipientEmail}</strong> gesendet.
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
        <form onSubmit={handleVerify}>
          {/* Code Input */}
          <div className="flex justify-center" style={{ marginBottom: "16px" }}>
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              containerClassName="gap-3"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot 
                  index={0} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
                <InputOTPSlot 
                  index={1} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
                <InputOTPSlot 
                  index={2} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
                <InputOTPSlot 
                  index={3} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
                <InputOTPSlot 
                  index={4} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
                <InputOTPSlot 
                  index={5} 
                  className="w-10 h-10 border-border text-base"
                  style={{ borderRadius: "0px" }}
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Buttons */}
          <div className="space-y-2" style={{ marginBottom: "16px" }}>
            {/* Primary Button - Bestätigen */}
            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "#2E2E2E",
                height: "24px",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "0px",
              }}
            >
              Bestätigen
            </button>

            {/* Secondary Button - Code erneut senden */}
            <button
              type="button"
              onClick={handleResendCode}
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
              Code erneut senden
            </button>

            {/* Text Link - Zurück */}
            <div className="text-center pt-1">
              <Link href="/register">
                <a
                  className="text-xs hover:underline cursor-pointer"
                  style={{ color: "#666", fontSize: "12px" }}
                >
                  Zurück
                </a>
              </Link>
            </div>
          </div>

          {/* Info Text */}
          <div className="text-center">
            <p className="text-xs leading-relaxed" style={{ color: "#777", fontSize: "11px", lineHeight: "1.6" }}>
              Der Code bleibt 10 Minuten gültig.<br />
              Wenn Sie keine E-Mail erhalten haben, prüfen Sie bitte Ihren Spam-Ordner<br />
              oder klicken Sie auf „Code erneut senden".
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
