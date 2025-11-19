/**
 * Notification System Stub
 * 
 * Sprint 1 Specification:
 * - Email notifications to producer when editor uploads are ready
 * - SMS alerts for urgent status changes
 * - This is a stub implementation to be replaced with actual notification service (Mailgun, Twilio, etc.)
 */

export interface Notification {
  id: string;
  type: 'email' | 'sms';
  recipient: string;
  subject?: string;
  message: string;
  sentAt?: number;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
}

// In-memory notification log for development
const notifications: Map<string, Notification> = new Map();

/**
 * Send email notification to producer
 * In production, this would use Mailgun or similar email service
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const notificationId = `email-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const notification: Notification = {
    id: notificationId,
    type: 'email',
    recipient: params.to,
    subject: params.subject,
    message: params.body,
    status: 'sent', // Stub: mark as sent immediately
    sentAt: Date.now(),
  };
  
  notifications.set(notificationId, notification);
  
  console.log(`📧 Email notification sent to ${params.to}: ${params.subject}`);
  console.log(`   Body: ${params.body}`);
  
  // TODO: In production, use actual email service
  // Example:
  // const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });
  // await mg.messages().send({
  //   from: 'PIX.IMMO <noreply@pix.immo>',
  //   to: params.to,
  //   subject: params.subject,
  //   text: params.body,
  // });
  
  return { ok: true, id: notificationId };
}

/**
 * Send SMS notification to producer
 * Production implementation using Twilio
 */
export async function sendSMS(params: {
  to: string;
  message: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const notificationId = `sms-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const notification: Notification = {
    id: notificationId,
    type: 'sms',
    recipient: params.to,
    message: params.message,
    status: 'pending',
  };
  
  notifications.set(notificationId, notification);
  
  try {
    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log(`📱 [DEV] SMS notification to ${params.to}: ${params.message}`);
      notification.status = 'sent';
      notification.sentAt = Date.now();
      return { ok: true, id: notificationId };
    }

    // Use Twilio to send actual SMS (ESM-compatible dynamic import)
    const { default: twilio } = await import('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: params.to,
      body: params.message,
    });
    
    notification.status = 'sent';
    notification.sentAt = Date.now();
    
    console.log(`📱 SMS sent via Twilio to ${params.to}`);
    
    return { ok: true, id: notificationId };
  } catch (error) {
    notification.status = 'failed';
    notification.error = error instanceof Error ? error.message : 'Unknown error';
    
    console.error(`❌ Failed to send SMS to ${params.to}:`, error);
    
    return { ok: false, error: notification.error };
  }
}

/**
 * Notify producer when handoff package is ready
 */
export async function notifyHandoffReady(params: {
  email: string;
  phone?: string;
  jobNumber: string;
  shootCode: string;
  downloadUrl: string;
}): Promise<void> {
  // Send email
  await sendEmail({
    to: params.email,
    subject: `Handoff-Paket bereit: ${params.jobNumber}`,
    body: `
Hallo,

das Handoff-Paket für Shooting ${params.shootCode} (Job ${params.jobNumber}) ist fertig.

Download-Link: ${params.downloadUrl}

Der Link ist 36 Stunden gültig.

Mit freundlichen Grüßen,
PIX.IMMO
    `.trim(),
  });
  
  // Send SMS if phone number provided
  if (params.phone) {
    await sendSMS({
      to: params.phone,
      message: `PIX.IMMO: Handoff-Paket ${params.jobNumber} bereit. Download-Link per E-Mail gesendet.`,
    });
  }
}

/**
 * Notify producer when editor has uploaded final images
 */
export async function notifyEditorUploadComplete(params: {
  email: string;
  phone?: string;
  jobNumber: string;
  shootCode: string;
  imageCount: number;
}): Promise<void> {
  // Send email
  await sendEmail({
    to: params.email,
    subject: `Editor-Upload abgeschlossen: ${params.jobNumber}`,
    body: `
Hallo,

der Editor hat ${params.imageCount} bearbeitete Bilder für Shooting ${params.shootCode} (Job ${params.jobNumber}) hochgeladen.

Die Bilder werden in 60 Minuten automatisch verarbeitet.

Mit freundlichen Grüßen,
PIX.IMMO
    `.trim(),
  });
  
  // Send SMS if phone number provided
  if (params.phone) {
    await sendSMS({
      to: params.phone,
      message: `PIX.IMMO: Editor-Upload ${params.jobNumber} abgeschlossen (${params.imageCount} Bilder).`,
    });
  }
}

/**
 * Get notification by ID
 */
export function getNotification(id: string): Notification | undefined {
  return notifications.get(id);
}

/**
 * Get all notifications (for debugging/admin)
 */
export function getAllNotifications(): Notification[] {
  return Array.from(notifications.values());
}

/**
 * Send booking confirmation SMS
 */
export async function notifyBookingConfirmation(params: {
  phone: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
}): Promise<void> {
  // Format date as DD.MM.YYYY (German format without weekday)
  const formattedDate = new Date(params.appointmentDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Calculate slot end time (90 minutes after start)
  const [hours, minutes] = params.appointmentTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

  await sendSMS({
    to: params.phone,
    message: `Hallo ${params.customerName},\n\nIhre Buchung bei pix.immo ist bestätigt.\n\nTermin:\n${formattedDate}, ${params.appointmentTime}–${endTime} Uhr\nAdresse: ${params.propertyAddress}\n\nWir freuen uns auf den Termin.\n\nIhr pix.immo Team`,
  });
}

/**
 * Send appointment reminder SMS (24h before)
 */
export async function notifyAppointmentReminder(params: {
  phone: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress: string;
}): Promise<void> {
  const formattedDate = new Date(params.appointmentDate).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
  });

  await sendSMS({
    to: params.phone,
    message: `PIX.IMMO Erinnerung: Morgen ${formattedDate} um ${params.appointmentTime} Uhr - ${params.propertyAddress}. Bei Fragen: info@pix.immo`,
  });
}

/**
 * Send appointment cancellation SMS
 */
export async function notifyAppointmentCancellation(params: {
  phone: string;
  customerName: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
}): Promise<void> {
  const formattedDate = new Date(params.appointmentDate).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const reasonText = params.reason ? ` Grund: ${params.reason}` : '';

  await sendSMS({
    to: params.phone,
    message: `PIX.IMMO: Termin am ${formattedDate} um ${params.appointmentTime} Uhr wurde storniert.${reasonText} Bei Fragen: info@pix.immo`,
  });
}
