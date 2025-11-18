import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

// Step 1: Email input schema
const emailSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
});

// Step 2: Code verification schema
const codeSchema = z.object({
  code: z.string().length(6, "Der Code muss 6 Ziffern haben").regex(/^\d{6}$/, "Der Code muss nur Ziffern enthalten"),
});

type EmailFormData = z.infer<typeof emailSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

export default function LoginOtp() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  // Load email from localStorage on mount (protection against refresh)
  useEffect(() => {
    const savedEmail = localStorage.getItem("otp_email");
    const savedStep = localStorage.getItem("otp_step");
    if (savedEmail && savedStep === "code") {
      setEmail(savedEmail);
      setStep("code");
    }
  }, []);

  // Guard rail: If on code step but no email, go back to email step
  useEffect(() => {
    if (step === "code" && !email) {
      console.warn("[OTP] No email in state, returning to email step");
      setStep("email");
      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_step");
    }
  }, [step, email]);

  // Email form
  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Code form
  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      code: "",
    },
  });

  // Request OTP mutation
  const requestOtpMutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      const res = await apiRequest("POST", "/api/auth/request-otp", data);
      return res.json();
    },
    onSuccess: (response: any, variables: EmailFormData) => {
      // Set email ONLY on success
      setEmail(variables.email);
      // Save to localStorage for refresh protection
      localStorage.setItem("otp_email", variables.email);
      localStorage.setItem("otp_step", "code");
      
      toast({
        title: "Code gesendet",
        description: response.message || "Bitte prüfe dein E-Mail-Postfach",
      });
      setStep("code");
      codeForm.setFocus("code");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Fehler beim Senden des Codes";
      
      // Reset email state on error
      setEmail("");
      // Clear localStorage on error
      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_step");
      
      // Handle rate limiting
      if (error.retryAfter) {
        setRetryAfter(error.retryAfter);
        toast({
          title: "Zu viele Anfragen",
          description: `Bitte warte ${error.retryAfter} Sekunden`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Verify OTP mutation
  const verifyOtpMutation = useMutation({
    mutationFn: async (data: CodeFormData & { email: string }) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", {
        email: data.email,
        code: data.code,
      });
      return res.json();
    },
    onSuccess: async () => {
      // Clear localStorage on successful login
      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_step");
      
      toast({
        title: "Angemeldet",
        description: "Du wurdest erfolgreich angemeldet",
      });
      
      // Fetch user info to determine routing
      try {
        const userRes = await fetch("/api/auth/me");
        if (userRes.ok) {
          const userData = await userRes.json();
          
          // Role-based routing
          if (userData.user.email === "janjira@pix.immo") {
            navigate("/admin/dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          // Fallback if user info fetch fails
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        navigate("/dashboard");
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Ungültiger Code";
      
      // Check if need new code (all attempts exhausted or expired)
      if (error.needNewCode) {
        toast({
          title: "Neuer Code erforderlich",
          description: errorMessage,
          variant: "destructive",
        });
        // Go back to email step
        setStep("email");
        setEmail("");
        localStorage.removeItem("otp_email");
        localStorage.removeItem("otp_step");
        codeForm.reset();
      } else {
        toast({
          title: "Fehler",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
  });

  // Handle email form submission
  const onEmailSubmit = (data: EmailFormData) => {
    // Don't set email here - will be set on successful mutation
    requestOtpMutation.mutate(data);
  };

  // Handle code form submission
  const onCodeSubmit = (data: CodeFormData) => {
    // Pass email from state (set on successful request)
    verifyOtpMutation.mutate({ ...data, email });
  };

  // Go back to email step
  const handleBackToEmail = () => {
    setStep("email");
    setEmail(""); // Reset email state
    setRetryAfter(null);
    codeForm.reset();
    // Clear localStorage
    localStorage.removeItem("otp_email");
    localStorage.removeItem("otp_step");
  };

  // Resend code
  const handleResendCode = () => {
    if (retryAfter && retryAfter > 0) {
      toast({
        title: "Bitte warte",
        description: `Du kannst in ${retryAfter} Sekunden einen neuen Code anfordern`,
        variant: "destructive",
      });
      return;
    }

    emailForm.handleSubmit(onEmailSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login mit E-Mail-Code</CardTitle>
          <CardDescription>
            {step === "email" 
              ? "Gib deine E-Mail-Adresse ein, um einen Login-Code zu erhalten"
              : "Gib den 6-stelligen Code ein, den wir dir gesendet haben"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="deine@email.de"
                            className="pl-10"
                            data-testid="input-email"
                            autoFocus
                            disabled={requestOtpMutation.isPending}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={requestOtpMutation.isPending}
                  data-testid="button-request-code"
                >
                  {requestOtpMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Code wird gesendet...
                    </>
                  ) : (
                    "Code anfordern"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...codeForm}>
              <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Code gesendet an: <span className="font-medium text-foreground">{email}</span>
                  </p>
                </div>

                <FormField
                  control={codeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>6-stelliger Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          placeholder="123456"
                          className="text-center text-2xl tracking-widest"
                          data-testid="input-code"
                          autoFocus
                          disabled={verifyOtpMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={verifyOtpMutation.isPending}
                    data-testid="button-verify-code"
                  >
                    {verifyOtpMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Code wird überprüft...
                      </>
                    ) : (
                      "Code überprüfen"
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleBackToEmail}
                      disabled={verifyOtpMutation.isPending}
                      data-testid="button-back"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Zurück
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleResendCode}
                      disabled={verifyOtpMutation.isPending || requestOtpMutation.isPending || (retryAfter !== null && retryAfter > 0)}
                      data-testid="button-resend"
                    >
                      {requestOtpMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        "Erneut senden"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Der Code ist 10 Minuten gültig
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
