import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle2 } from "lucide-react";

const requestResetSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
});

type RequestResetData = z.infer<typeof requestResetSchema>;

export default function RequestPasswordReset() {
  const { toast } = useToast();
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestedEmail, setRequestedEmail] = useState("");

  const form = useForm<RequestResetData>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const requestResetMutation = useMutation({
    mutationFn: async (data: RequestResetData) => {
      const res = await apiRequest("POST", "/api/auth/request-password-reset", data);
      return res.json();
    },
    onSuccess: (response) => {
      setRequestedEmail(form.getValues("email"));
      setRequestSuccess(true);
      toast({
        title: "E-Mail gesendet",
        description: response.message,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Ein Fehler ist aufgetreten",
      });
    },
  });

  const onSubmit = (data: RequestResetData) => {
    requestResetMutation.mutate(data);
  };

  // Success view after request
  if (requestSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/">
              <div className="inline-flex items-center cursor-pointer">
                <span className="text-base font-semibold tracking-wide">PIX.IMMO</span>
              </div>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>E-Mail gesendet</CardTitle>
              <CardDescription>Prüfe dein Postfach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Passwort-Reset-E-Mail gesendet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      an {requestedEmail}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Falls ein Konto mit dieser E-Mail existiert, erhältst du eine E-Mail mit einem Link zum Zurücksetzen deines Passworts.
                </p>
                <p>
                  Der Link ist 1 Stunde lang gültig.
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Link href="/login">
                  <Button className="w-full" data-testid="button-login">
                    Zum Login
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setRequestSuccess(false);
                    form.reset();
                  }}
                  data-testid="button-request-again"
                >
                  Erneut anfordern
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Request form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="inline-flex items-center cursor-pointer">
              <span className="text-base font-semibold tracking-wide">PIX.IMMO</span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Passwort zurücksetzen</CardTitle>
            <CardDescription>
              Gib deine E-Mail-Adresse ein, um einen Passwort-Reset-Link zu erhalten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="deine@email.de"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={requestResetMutation.isPending}
                  data-testid="button-submit"
                >
                  {requestResetMutation.isPending ? "Wird gesendet..." : "Reset-Link senden"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <Link href="/login">
                <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                  Zurück zum Login
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
