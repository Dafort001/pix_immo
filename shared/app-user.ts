/**
 * Lokale App-Nutzer für Mobile PWA (Offline-Speicherung)
 * Gespeichert in localStorage, nicht in PostgreSQL
 */

export interface AppUser {
  userId: string;      // UUID
  name: string;        // Vollständiger Name
  initials: string;    // 2 Buchstaben (z.B. "DF" aus "Daniel Fischer")
  userCode: string;    // 4-6 Zeichen, ohne O/0/I/1
  colorTag: string;    // Hex-Farbe aus Hash (z.B. "#4A5849")
  createdAt: number;   // Timestamp
  isActive: boolean;   // Aktuell ausgewählter Nutzer
}

/**
 * Generiert Initialen aus einem Namen
 * Beispiele:
 * - "Daniel Fischer" → "DF"
 * - "Anna-Maria" → "AM"
 * - "von der Heide" → "VH"
 */
export function generateInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return 'XX';
  
  // Teile bei Leerzeichen oder Bindestrichen
  const parts = cleaned.split(/[\s-]+/).filter(p => p.length > 0);
  
  if (parts.length === 0) return 'XX';
  if (parts.length === 1) {
    // Einzelwort: Nimm erste 2 Buchstaben
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Mehrere Wörter: Nimm ersten Buchstaben von jedem Wort (max 2)
  return parts
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

/**
 * Generiert user_code (4-6 Zeichen, ohne O/0/I/1)
 * Verwendet allowed_chars = A-Z (ohne O, I) + 2-9 (ohne 0, 1)
 * Beispiele: "A3B7", "K9M2P", "D4F6G8"
 */
export function generateUserCode(existingCodes: string[] = []): string {
  // Erlaubte Zeichen: A-Z ohne O, I + Ziffern 2-9 (ohne 0, 1)
  const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 Zeichen
  const codeLength = 4 + Math.floor(Math.random() * 3); // 4-6 Zeichen
  
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    let code = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      code += allowedChars[randomIndex];
    }
    
    // Prüfe ob eindeutig
    if (!existingCodes.includes(code)) {
      return code;
    }
    
    attempts++;
  }
  
  // Fallback: Timestamp-basiert
  return `U${Date.now().toString().slice(-5)}`;
}

/**
 * Generiert Farb-Tag aus Name-Hash
 * Liefert konsistente Farbe pro Name
 */
export function generateColorTag(name: string): string {
  // Einfacher String-Hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Konvertiere zu HSL für schöne, lesbare Farben
  // Hue: 0-360, Saturation: 40-60%, Lightness: 35-55% (gut lesbar auf weiß)
  const hue = Math.abs(hash % 360);
  const saturation = 40 + (Math.abs(hash >> 8) % 20); // 40-60%
  const lightness = 35 + (Math.abs(hash >> 16) % 20); // 35-55%
  
  // Konvertiere HSL zu Hex
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  
  const hslToRgb = (h: number, s: number, l: number) => {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };
  
  const [r, g, b] = hslToRgb(h, s, l);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Erstellt einen neuen App-Nutzer
 */
export function createAppUser(name: string, existingUsers: AppUser[] = []): AppUser {
  const existingCodes = existingUsers.map(u => u.userCode);
  
  return {
    userId: crypto.randomUUID(),
    name: name.trim(),
    initials: generateInitials(name),
    userCode: generateUserCode(existingCodes),
    colorTag: generateColorTag(name),
    createdAt: Date.now(),
    isActive: false,
  };
}
