export interface PushTemplate {
  id: string;
  type: 'status' | 'editor' | 'marketing';
  titleDe: string;
  titleEn: string;
  messageDe: string;
  messageEn: string;
}

export const PUSH_TEMPLATES: Record<string, PushTemplate> = {
  upload_done: {
    id: 'upload_done',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Deine Bilder wurden erfolgreich hochgeladen. Wir prüfen sie jetzt.',
    messageEn: "Your photos have been uploaded successfully. We're reviewing them now.",
  },
  job_confirmed: {
    id: 'job_confirmed',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Dein Auftrag #{job_id} wurde bestätigt und ist in Bearbeitung.',
    messageEn: 'Your order #{job_id} has been confirmed and is now being processed.',
  },
  edit_done: {
    id: 'edit_done',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Deine bearbeiteten Fotos sind jetzt in deiner Galerie verfügbar.',
    messageEn: 'Your edited photos are now available in your gallery.',
  },
  editor_comment: {
    id: 'editor_comment',
    type: 'editor',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Der Editor hat eine Rückfrage zu einem deiner Bilder. Bitte kurz prüfen.',
    messageEn: 'Your editor has a question about one of your photos. Please take a look.',
  },
  expose_ready: {
    id: 'expose_ready',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Dein Exposé-Text ist fertig. Du kannst ihn jetzt in der App lesen.',
    messageEn: 'Your property description is ready. You can read it now in the app.',
  },
  gallery_expiring: {
    id: 'gallery_expiring',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Deine Galerie bleibt noch 7 Tage online. Jetzt herunterladen oder verlängern.',
    messageEn: 'Your gallery will remain online for 7 days. Download or extend now.',
  },
  test_message: {
    id: 'test_message',
    type: 'status',
    titleDe: 'pix.immo',
    titleEn: 'pix.immo',
    messageDe: 'Beispielnachricht von pix.immo – so sieht dein Update aus.',
    messageEn: 'Test message from pix.immo – this is how your updates appear.',
  },
};

// Helper function to replace placeholders
export function fillPushTemplate(
  template: PushTemplate,
  language: 'de' | 'en',
  replacements: Record<string, string> = {}
): { title: string; message: string } {
  let title = language === 'de' ? template.titleDe : template.titleEn;
  let message = language === 'de' ? template.messageDe : template.messageEn;

  // Replace placeholders
  Object.entries(replacements).forEach(([key, value]) => {
    const placeholder = `#{${key}}`;
    title = title.replace(placeholder, value);
    message = message.replace(placeholder, value);
  });

  return { title, message };
}
