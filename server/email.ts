import { Resend } from "resend";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize Resend client for invoices
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// AWS SES Configuration for OTP emails
const AWS_SES_ACCESS_KEY_ID = process.env.AWS_SES_ACCESS_KEY_ID;
const AWS_SES_SECRET_ACCESS_KEY = process.env.AWS_SES_SECRET_ACCESS_KEY;
const AWS_SES_REGION = process.env.AWS_SES_REGION || "eu-central-1";
const AWS_SES_FROM_ADDRESS = process.env.AWS_SES_FROM_ADDRESS || "no-reply@pix.immo";

// Check if SES is configured
const isSesConfigured = !!(AWS_SES_ACCESS_KEY_ID && AWS_SES_SECRET_ACCESS_KEY);

// Initialize SES client if configured
let sesClient: SESClient | null = null;
if (isSesConfigured) {
  sesClient = new SESClient({
    region: AWS_SES_REGION,
    credentials: {
      accessKeyId: AWS_SES_ACCESS_KEY_ID!,
      secretAccessKey: AWS_SES_SECRET_ACCESS_KEY!,
    },
  });
  console.log(`[EMAIL] AWS SES configured for region: ${AWS_SES_REGION}`);
} else {
  console.log("[EMAIL] AWS SES not configured - OTP emails will run in DRY-RUN mode");
  console.log("[EMAIL] Set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY to enable OTP email sending");
}

export interface SendInvoiceEmailParams {
  to: string;
  customerName: string;
  invoiceNumber: string;
  invoiceDate: Date;
  grossAmount: number; // in cents
  pdfAttachment?: {
    filename: string;
    content: Buffer;
  };
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send invoice email to customer using Resend
 */
export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<EmailResponse> {
  if (!resend) {
    return {
      success: false,
      error: "Resend API key not configured. Please set RESEND_API_KEY environment variable.",
    };
  }

  const { to, customerName, invoiceNumber, invoiceDate, grossAmount, pdfAttachment } = params;

  // Format amount for display (cents to EUR)
  const formattedAmount = (grossAmount / 100).toFixed(2);
  const formattedDate = invoiceDate.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Email HTML content
  const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4A5849;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .invoice-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .invoice-row:last-child {
      border-bottom: none;
      font-weight: bold;
      font-size: 1.2em;
      color: #4A5849;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      color: #666;
      font-size: 0.9em;
    }
    .button {
      display: inline-block;
      background-color: #A85B2E;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">pix.immo</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Professionelle Immobilienfotografie</p>
  </div>
  
  <div class="content">
    <h2 style="color: #4A5849; margin-top: 0;">Ihre Rechnung ${invoiceNumber}</h2>
    
    <p>Sehr geehrte/r ${customerName},</p>
    
    <p>vielen Dank für Ihren Auftrag! Im Anhang finden Sie Ihre Rechnung als PDF-Datei.</p>
    
    <div class="invoice-details">
      <div class="invoice-row">
        <span>Rechnungsnummer:</span>
        <span><strong>${invoiceNumber}</strong></span>
      </div>
      <div class="invoice-row">
        <span>Rechnungsdatum:</span>
        <span>${formattedDate}</span>
      </div>
      <div class="invoice-row">
        <span>Gesamtbetrag (inkl. MwSt.):</span>
        <span>€${formattedAmount}</span>
      </div>
    </div>
    
    <p>Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer innerhalb der angegebenen Zahlungsfrist.</p>
    
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    
    <p style="margin-top: 30px;">
      Mit freundlichen Grüßen,<br>
      <strong>Ihr pix.immo Team</strong>
    </p>
  </div>
  
  <div class="footer">
    <p>pix.immo – Professionelle Immobilienfotografie in Hamburg</p>
    <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
  </div>
</body>
</html>
  `.trim();

  // Plain text version
  const textContent = `
pix.immo - Ihre Rechnung ${invoiceNumber}

Sehr geehrte/r ${customerName},

vielen Dank für Ihren Auftrag! Im Anhang finden Sie Ihre Rechnung als PDF-Datei.

Rechnungsdetails:
- Rechnungsnummer: ${invoiceNumber}
- Rechnungsdatum: ${formattedDate}
- Gesamtbetrag (inkl. MwSt.): €${formattedAmount}

Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer innerhalb der angegebenen Zahlungsfrist.

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
Ihr pix.immo Team

---
pix.immo – Professionelle Immobilienfotografie in Hamburg
Diese E-Mail wurde automatisch generiert.
  `.trim();

  try {
    const emailData: any = {
      from: "pix.immo <invoices@pix.immo>",
      to: [to],
      subject: `Rechnung ${invoiceNumber} von pix.immo`,
      html: htmlContent,
      text: textContent,
    };

    // Add PDF attachment if provided
    if (pdfAttachment) {
      emailData.attachments = [
        {
          filename: pdfAttachment.filename,
          content: pdfAttachment.content,
        },
      ];
    }

    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send test email to verify Resend configuration
 */
export async function sendTestEmail(to: string): Promise<EmailResponse> {
  if (!resend) {
    return {
      success: false,
      error: "Resend API key not configured",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "pix.immo <test@pix.immo>",
      to: [to],
      subject: "Test E-Mail von pix.immo",
      html: "<p>Dies ist eine Test-E-Mail von pix.immo. Ihre E-Mail-Konfiguration funktioniert!</p>",
      text: "Dies ist eine Test-E-Mail von pix.immo. Ihre E-Mail-Konfiguration funktioniert!",
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send OTP code via email using AWS SES
 * 
 * @param to - Recipient email address
 * @param code - 6-digit OTP code
 * @returns Promise<void>
 * 
 * Behavior:
 * - If SES is configured: Sends real email via AWS SES (eu-central-1)
 * - If SES is not configured: Logs to console (Dry-Run mode)
 */
export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const subject = "Dein pix.immo Login-Code";
  const body = generateOtpEmailBody(code);

  if (!isSesConfigured || !sesClient) {
    // DRY-RUN mode: Log to console
    console.log("\n" + "=".repeat(60));
    console.log("[EMAIL DRY-RUN] SES not configured - Email not sent");
    console.log("=".repeat(60));
    console.log(`To: ${to}`);
    console.log(`From: ${AWS_SES_FROM_ADDRESS}`);
    console.log(`Subject: ${subject}`);
    console.log("-".repeat(60));
    console.log(body);
    console.log("=".repeat(60) + "\n");
    return;
  }

  // PRODUCTION mode: Send via SES
  try {
    const command = new SendEmailCommand({
      Source: AWS_SES_FROM_ADDRESS,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: body,
            Charset: "UTF-8",
          },
        },
      },
    });

    await sesClient.send(command);
    console.log(`[EMAIL] OTP sent successfully to ${to} via AWS SES`);
  } catch (error) {
    console.error("[EMAIL] Failed to send OTP via SES:", error);
    throw new Error("Failed to send OTP email");
  }
}

/**
 * Generate OTP email body (plaintext only, no links)
 */
function generateOtpEmailBody(code: string): string {
  return `Hallo,

hier ist dein Login-Code für pix.immo:

    ${code}

Dieser Code ist 10 Minuten lang gültig.

Falls du diese E-Mail nicht angefordert hast, kannst du sie einfach ignorieren.

Viele Grüße,
dein pix.immo Team

---
Diese E-Mail wurde automatisch generiert. Bitte antworte nicht auf diese E-Mail.`;
}
