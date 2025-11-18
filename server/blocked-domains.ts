/**
 * Blocked Email Domains
 * 
 * List of disposable and relay email domains that are not allowed for registration.
 * Normal email providers (gmail.com, icloud.com, outlook.com, etc.) are allowed.
 */

export const DISALLOWED_EMAIL_DOMAINS = [
  // Apple Hide My Email / Private Relay
  'privaterelay.appleid.com',
  
  // Firefox/Mozilla Relay
  'relay.firefox.com',
  'mozmail.com',
  'firefox.relay.com',
  
  // Temporary/Disposable Email Services
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'grr.la',
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.com',
  'throwaway.email',
  'throwawaymail.com',
  'mailinator.com',
  'mailinator.net',
  'mailinator2.com',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  'trashmail.net',
  'tempinbox.com',
  'mintemail.com',
  'mytemp.email',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'dispostable.com',
  'fakeinbox.com',
  'emailondeck.com',
  'anonbox.net',
  'binkmail.com',
  'spamgourmet.com',
  'mailnesia.com',
  'mailcatch.com',
  '33mail.com',
  'jetable.org',
  'mohmal.com',
  'incognitomail.com',
  'spambox.us',
  'airmail.cc',
  'getairmail.com',
  'anonymbox.com',
  'burnermail.io',
  'hide.bz',
  'mytrashmail.com',
  'tempr.email',
  'disposablemail.com',
  'fakemail.net',
];

/**
 * Check if an email address uses a disposable/relay domain
 * @param email Email address to check
 * @returns true if email domain is blocked, false otherwise
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) {
    return false;
  }
  
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) {
    return false;
  }
  
  return DISALLOWED_EMAIL_DOMAINS.includes(domain);
}

/**
 * Get a user-friendly error message for blocked email domains
 */
export function getDisposableEmailErrorMessage(): string {
  return "Bitte verwenden Sie eine geschäftliche E-Mail-Adresse. Temporäre E-Mail-Dienste und Weiterleitungen (z.B. Apple Hide My Email, Firefox Relay) sind nicht erlaubt.";
}
