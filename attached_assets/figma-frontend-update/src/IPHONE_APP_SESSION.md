# 🔐 PIX.IMMO iPhone App - Session Handling

Vollständige Dokumentation des Session-Managements und Token-basierten Authentifizierungssystems.

## 📋 Übersicht

Die PIX.IMMO iPhone App verwendet ein Token-basiertes Authentifizierungssystem mit automatischem Session-Check beim App-Start.

## 🔄 App-Start Flow

```
┌─────────────────────────────────────────────────────────┐
│                    App Start (/app)                      │
│                   Splash Screen                          │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────────┐
         │  Token-Check (1.2s) │
         │  localStorage       │
         └────────┬───────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
   ┌─────────┐      ┌──────────┐
   │ Gültig? │      │Ungültig? │
   └────┬────┘      └─────┬────┘
        │                 │
        ▼                 ▼
  ┌──────────┐      ┌──────────┐
  │/app/jobs │      │/app/login│
  └──────────┘      └──────────┘
```

## 🗝️ Token-Struktur

### Gespeicherte Daten
```typescript
// localStorage Keys
'pix_session_token'   // JWT oder Session-Token
'pix_token_expiry'    // ISO 8601 Datum-String
'pix_user_email'      // E-Mail des Users
```

### Token-Laufzeiten

| Modus | Laufzeit | Use-Case |
|-------|----------|----------|
| **Normal Login** | 24 Stunden | Standard-Login ohne "Angemeldet bleiben" |
| **Angemeldet bleiben** | 30 Tage | User wählt "Angemeldet bleiben" |
| **Demo-Modus** | 2 Stunden | "Demo starten" ohne Anmeldung |

## 📱 Implementierung

### 1. Splash Screen (`/pages/app-splash.tsx`)

**Funktion:**
- Zeigt Logo-Animation (1.2s)
- Prüft Token im Hintergrund
- Navigiert automatisch

**Code:**
```typescript
const checkSession = async () => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const sessionToken = localStorage.getItem('pix_session_token');
  const tokenExpiry = localStorage.getItem('pix_token_expiry');
  
  if (sessionToken && tokenExpiry) {
    const expiryDate = new Date(tokenExpiry);
    const now = new Date();
    
    if (expiryDate > now) {
      setLocation('/app/jobs'); // Token gültig
      return;
    }
  }
  
  setLocation('/app/login'); // Kein gültiger Token
};
```

### 2. Login (`/pages/app-login.tsx`)

**Funktion:**
- E-Mail/Passwort Login
- Token-Generierung
- Token-Speicherung mit Expiry

**Code:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  
  // API-Call simulieren
  setTimeout(() => {
    const mockToken = 'mock_jwt_token_' + Date.now();
    const expiryDate = new Date();
    
    if (rememberMe) {
      expiryDate.setDate(expiryDate.getDate() + 30); // 30 Tage
    } else {
      expiryDate.setHours(expiryDate.getHours() + 24); // 24h
    }
    
    // Token speichern
    localStorage.setItem('pix_session_token', mockToken);
    localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
    localStorage.setItem('pix_user_email', email);
    
    setIsLoading(false);
    setLocation('/app/jobs');
  }, 1500);
};
```

**Demo-Modus:**
```typescript
const handleDemoStart = () => {
  const mockToken = 'demo_token_' + Date.now();
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 2); // 2h
  
  localStorage.setItem('pix_session_token', mockToken);
  localStorage.setItem('pix_token_expiry', expiryDate.toISOString());
  localStorage.setItem('pix_user_email', 'demo@pix.immo');
  
  setLocation('/app/jobs');
};
```

### 3. Logout (`/pages/app-settings.tsx`)

**Funktion:**
- Löscht alle Session-Daten
- Bestätigungs-Dialog
- Redirect zum Login

**Code:**
```typescript
const handleLogout = () => {
  // Token löschen
  localStorage.removeItem('pix_session_token');
  localStorage.removeItem('pix_token_expiry');
  localStorage.removeItem('pix_user_email');
  
  // Zurück zum Login
  setLocation('/app/login');
};
```

## 🔒 Security Considerations

### Current Implementation (Development)
```typescript
// localStorage (unsicher für Production)
localStorage.setItem('pix_session_token', token);
```

### Production Implementation
```typescript
// SecureStorage / iOS Keychain (empfohlen)
import SecureStore from 'expo-secure-store';

// Token speichern
await SecureStore.setItemAsync('pix_session_token', token);

// Token abrufen
const token = await SecureStore.getItemAsync('pix_session_token');

// Token löschen
await SecureStore.deleteItemAsync('pix_session_token');
```

### Best Practices

1. **HTTPS-only**
   - Alle API-Calls über HTTPS
   - Certificate Pinning in Production

2. **Token-Rotation**
   - Refresh-Tokens verwenden
   - Access-Token mit kurzer Laufzeit (15-30 Min)
   - Refresh-Token mit langer Laufzeit (30 Tage)

3. **Biometrische Auth**
   - Face ID / Touch ID Integration
   - Optional beim App-Start
   - Zusätzliche Sicherheitsebene

4. **Token-Validierung**
   ```typescript
   // Server-Side Token-Validierung
   const validateToken = async (token: string) => {
     const response = await fetch('/api/auth/validate', {
       headers: { 'Authorization': `Bearer ${token}` }
     });
     return response.ok;
   };
   ```

## 🧪 Testing

### Test-Szenarien

1. **Erster App-Start**
   - [ ] Splash Screen erscheint
   - [ ] Nach 1.2s → Login-Screen
   - [ ] Kein Token vorhanden

2. **Login mit "Angemeldet bleiben"**
   - [ ] Login erfolgreich
   - [ ] Token wird gespeichert (30 Tage)
   - [ ] Redirect zu Jobs-Liste

3. **Login ohne "Angemeldet bleiben"**
   - [ ] Login erfolgreich
   - [ ] Token wird gespeichert (24h)
   - [ ] Redirect zu Jobs-Liste

4. **Demo-Modus**
   - [ ] "Demo starten" klicken
   - [ ] Demo-Token (2h) wird gespeichert
   - [ ] Redirect zu Jobs-Liste

5. **App-Neustart mit gültigem Token**
   - [ ] Splash Screen erscheint
   - [ ] Token-Check erfolgreich
   - [ ] Direkter Redirect zu Jobs-Liste (kein Login)

6. **App-Neustart mit abgelaufenem Token**
   - [ ] Splash Screen erscheint
   - [ ] Token ungültig
   - [ ] Redirect zu Login-Screen

7. **Logout**
   - [ ] Bestätigungs-Dialog erscheint
   - [ ] Token wird gelöscht
   - [ ] Redirect zu Login-Screen

8. **Token-Expiry während App-Nutzung**
   - [ ] API-Call schlägt fehl (401)
   - [ ] Token wird gelöscht
   - [ ] Redirect zu Login mit Info-Message

## 📊 State-Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        APP START                          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │Splash Screen │
              │  (1.2s min)  │
              └──────┬───────┘
                     │
              ┌──────▼────────┐
              │ Token-Check   │
              │ localStorage  │
              └──────┬────────┘
                     │
      ┌──────────────┴──────────────┐
      │                             │
      ▼                             ▼
┌───────────┐                 ┌──────────┐
│Token OK?  │                 │No Token? │
│Valid Date?│                 │Expired?  │
└─────┬─────┘                 └─────┬────┘
      │YES                          │NO
      ▼                             ▼
┌────────────┐              ┌────────────┐
│ /app/jobs  │◄─────────────┤/app/login  │
│            │   Login      │            │
└──────┬─────┘   Success    └─────┬──────┘
       │                           │
       │                           │Demo
       │         Logout            │Mode
       │            │              │
       └────────────┼──────────────┘
                    │
                    ▼
              ┌──────────┐
              │ Delete   │
              │  Token   │
              └──────────┘
```

## 🔧 Migration zu Production

### Schritt 1: SecureStore Integration
```bash
npm install expo-secure-store
```

### Schritt 2: Token-Service erstellen
```typescript
// services/tokenService.ts
import * as SecureStore from 'expo-secure-store';

export const TokenService = {
  async setToken(token: string, expiry: string) {
    await SecureStore.setItemAsync('pix_session_token', token);
    await SecureStore.setItemAsync('pix_token_expiry', expiry);
  },
  
  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('pix_session_token');
  },
  
  async isValid(): Promise<boolean> {
    const token = await this.getToken();
    const expiry = await SecureStore.getItemAsync('pix_token_expiry');
    
    if (!token || !expiry) return false;
    
    return new Date(expiry) > new Date();
  },
  
  async clear() {
    await SecureStore.deleteItemAsync('pix_session_token');
    await SecureStore.deleteItemAsync('pix_token_expiry');
    await SecureStore.deleteItemAsync('pix_user_email');
  }
};
```

### Schritt 3: API-Integration
```typescript
// services/authService.ts
export const AuthService = {
  async login(email: string, password: string) {
    const response = await fetch('https://api.pix.immo/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const { token, expiry } = await response.json();
    await TokenService.setToken(token, expiry);
    
    return true;
  },
  
  async validateToken() {
    const token = await TokenService.getToken();
    if (!token) return false;
    
    const response = await fetch('https://api.pix.immo/auth/validate', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return response.ok;
  }
};
```

## 📚 Referenzen

- **iOS Keychain**: https://developer.apple.com/documentation/security/keychain_services
- **Expo SecureStore**: https://docs.expo.dev/versions/latest/sdk/securestore/
- **JWT Best Practices**: https://tools.ietf.org/html/rfc7519
- **OAuth 2.0**: https://oauth.net/2/

---

**Version**: 1.0.0  
**Status**: ✅ Development Implementation  
**Nächster Schritt**: Production Security mit SecureStore
