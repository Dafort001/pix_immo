# 💰 pixcapture.app - Bravo Studio Pricing Info

**Für Bravo Plan-Auswahl**  
**Date:** 2025-11-06

---

## 📊 Seitenanzahl pixcapture.app

### ✅ **GESAMT: 21 Seiten**

Aufgeteilt in 3 Kategorien:

---

## 📱 **1. Public Website (7 Seiten)**

Diese Seiten sind für Marketing/Info auf pixcapture.app:

```
1. pixcapture-home.tsx          - Homepage mit CTA Cards
2. pixcapture-about.tsx         - Über uns
3. pixcapture-help.tsx          - Help Center
4. pixcapture-expert-call.tsx   - Expert Call (Coming Soon)
5. pixcapture-impressum.tsx     - Impressum
6. pixcapture-datenschutz.tsx   - Datenschutz
7. pixcapture-agb.tsx           - AGB
```

**Routing:**
- `/pixcapture-home`
- `/pixcapture-about`
- `/pixcapture-help`
- `/pixcapture-expert-call`
- `/pixcapture-impressum`
- `/pixcapture-datenschutz`
- `/pixcapture-agb`

---

## 🖥️ **2. Standalone App Pages (6 Seiten)**

Diese Seiten sind für die Web-Version der App (Desktop/Tablet):

```
8.  app-login.tsx               - Login (OTP)
9.  app-upload.tsx              - Upload Interface
10. app-jobs.tsx                - Job Übersicht
11. app-gallery.tsx             - Gallery mit Rooms
12. app-settings.tsx            - Settings
13. app-notifications.tsx       - Notifications
```

**Routing:**
- `/app-login`
- `/app-upload`
- `/app-jobs`
- `/app-gallery`
- `/app-settings`
- `/app-notifications`

---

## 📱 **3. iPhone App Pages (8 Seiten)**

Diese Seiten sind für die native iPhone App:

```
14. app-splash.tsx              - Splash Screen
15. app-splash-firstlaunch.tsx  - First Launch Welcome
16. app-verify-user.tsx         - User Verification (OTP)
17. app-camera.tsx              - Camera Interface (HDR)
18. app-camera-landscape-demo.tsx - Camera Landscape Mode
19. app-index.tsx               - App Overview/Home
20. app-nav.tsx                 - Navigation Demo
21. app-job-new.tsx             - New Job Creation
```

**Routing:**
- `/pixcapture-app` (splash)
- `/pixcapture-app/firstlaunch`
- `/pixcapture-app/verify`
- `/pixcapture-app/camera`
- `/pixcapture-app/camera-landscape`
- `/pixcapture-app/overview`
- `/pixcapture-app/nav`
- `/pixcapture-app/job-new`

---

## 🎯 Empfehlung für Bravo Plans

### **Option A: Minimum Viable Product (14 Seiten)**

Nur essentiell für Launch:

```
Public (4):
✅ pixcapture-home
✅ pixcapture-help
✅ pixcapture-impressum
✅ pixcapture-datenschutz

iPhone App (10):
✅ app-splash
✅ app-splash-firstlaunch
✅ app-verify-user
✅ app-login (shared)
✅ app-camera
✅ app-upload (shared)
✅ app-jobs (shared)
✅ app-gallery (shared)
✅ app-settings (shared)
✅ app-job-new
```

**Bravo Plan benötigt:** 15 Screens (mit Buffer)

---

### **Option B: Standard Launch (18 Seiten) ⭐ EMPFOHLEN**

MVP + wichtige Zusatzfeatures:

```
Public (6):
✅ pixcapture-home
✅ pixcapture-about
✅ pixcapture-help
✅ pixcapture-impressum
✅ pixcapture-datenschutz
✅ pixcapture-agb

Standalone App (6):
✅ app-login
✅ app-upload
✅ app-jobs
✅ app-gallery
✅ app-settings
✅ app-notifications

iPhone App (6 unique):
✅ app-splash
✅ app-splash-firstlaunch
✅ app-verify-user
✅ app-camera
✅ app-camera-landscape-demo
✅ app-job-new
```

**Bravo Plan benötigt:** 20 Screens (mit Buffer)

---

### **Option C: Full Feature Set (21 Seiten)**

Alles inklusive:

```
✅ Alle 7 Public Pages
✅ Alle 6 Standalone App Pages
✅ Alle 8 iPhone App Pages
```

**Bravo Plan benötigt:** 25 Screens (mit Buffer)

---

## 💡 Bravo Studio Plan-Übersicht

### **Typical Bravo Pricing (Stand 2024):**

| Plan | Screens | Preis/Monat | Empfehlung |
|------|---------|-------------|------------|
| **Starter** | 10 Screens | ~$19 | ❌ Zu wenig |
| **Pro** | 25 Screens | ~$49 | ✅ **IDEAL** |
| **Business** | 50 Screens | ~$99 | ⚠️ Overkill |
| **Enterprise** | Unlimited | Custom | ⚠️ Nicht nötig |

**✅ Empfehlung: PRO Plan ($49/Monat)**
- 25 Screens reichen für alle 21 Seiten + Buffer
- Alle Features verfügbar
- TestFlight Support
- Custom Domains
- Push Notifications

---

## 📋 Detaillierte Screen-Zählung für Bravo

Bravo Studio zählt manchmal unterschiedlich:

### Was als 1 Screen zählt:
```
✅ 1 Page = 1 Screen
✅ 1 Modal = 1 Screen (falls als separate Page)
✅ 1 Tab = Teil von 1 Screen (wenn Tab-Navigation)
```

### Unsere Screens:
```
Public Website:        7 Screens
Standalone App:        6 Screens
iPhone App (unique):   8 Screens
                     ___________
TOTAL:                21 Screens

+ Buffer (Modals etc): 4 Screens
                     ___________
SAFE ESTIMATE:        25 Screens
```

---

## 🎯 Screen-Priorisierung

Falls du einen kleineren Plan wählst, hier die Priorität:

### **MUST HAVE (Core - 10 Screens):**
```
1. ⭐ app-splash (iPhone)
2. ⭐ app-verify-user (iPhone)
3. ⭐ app-camera (iPhone)
4. ⭐ app-upload (Shared)
5. ⭐ app-jobs (Shared)
6. ⭐ app-gallery (Shared)
7. ⭐ pixcapture-home (Public)
8. ⭐ pixcapture-help (Public)
9. ⭐ pixcapture-impressum (Legal)
10. ⭐ pixcapture-datenschutz (Legal)
```

### **SHOULD HAVE (Important - 6 Screens):**
```
11. 🟢 app-splash-firstlaunch (iPhone)
12. 🟢 app-settings (Shared)
13. 🟢 app-notifications (Shared)
14. 🟢 app-job-new (iPhone)
15. 🟢 pixcapture-about (Public)
16. 🟢 pixcapture-agb (Legal)
```

### **NICE TO HAVE (Optional - 5 Screens):**
```
17. 🔵 app-camera-landscape-demo (iPhone)
18. 🔵 app-index (iPhone)
19. 🔵 app-nav (iPhone)
20. 🔵 pixcapture-expert-call (Public)
21. 🔵 app-login (wenn separate von verify)
```

---

## 💰 Kosten-Kalkulation

### **Szenario 1: Starter Plan (10 Screens) - $19/Monat**
```
Status: ❌ NICHT EMPFOHLEN
Screens: 10/10 genutzt
Fehlende Features:
- Kein TestFlight Support
- Keine Custom Domain
- Limitierte API Calls
- Kein Multi-Language
```

### **Szenario 2: Pro Plan (25 Screens) - $49/Monat ⭐**
```
Status: ✅ EMPFOHLEN
Screens: 21/25 genutzt (4 Buffer)
Included Features:
- ✅ TestFlight Support
- ✅ Custom Domain (pixcapture.app)
- ✅ Unlimited API Calls
- ✅ Push Notifications
- ✅ Multi-Language Support
- ✅ Analytics
- ✅ Custom Icons & Splash
```

### **Szenario 3: Business Plan (50 Screens) - $99/Monat**
```
Status: ⚠️ OVERKILL (für jetzt)
Screens: 21/50 genutzt (29 ungenutzt)
Extra Features:
- White Label
- Priority Support
- Dedicated Account Manager
→ Erst später upgraden wenn nötig
```

---

## 📊 ROI-Überlegung

### **Pro Plan ($49/Monat) vs. Native Development:**

Native iOS/Android App Entwicklung:
```
Developer (60h × $100/h):     $6,000
Design (20h × $80/h):         $1,600
QA/Testing (10h × $60/h):       $600
App Store Setup:                $200
                              ________
TOTAL:                        $8,400
```

Bravo Studio (6 Monate):
```
Pro Plan (6 × $49):            $294
Development Time (20h × $100): $2,000
                              ________
TOTAL:                        $2,294

SAVINGS:                      $6,106 (73%)
```

**✅ ROI: Break-even nach 5 Monaten**

---

## 🚀 Launch-Strategie

### **Phase 1: TestFlight (Monat 1-2)**
```
Plan: Pro ($49/Monat)
Screens: 21 Screens
Users: 10-20 Beta Tester
Cost: $98
```

### **Phase 2: Soft Launch (Monat 3-4)**
```
Plan: Pro ($49/Monat)
Screens: 21-25 Screens (+ Optimierungen)
Users: 100-500
Cost: $98
```

### **Phase 3: Full Launch (Monat 5+)**
```
Plan: Pro oder Business (je nach Nutzung)
Screens: 25-30 Screens (+ neue Features)
Users: 1,000+
Cost: $49-99/Monat
```

### **Upgrade Trigger:**
```
Upgrade zu Business wenn:
- > 5,000 aktive User
- > 30 Screens benötigt
- White Label gewünscht
- Dedicated Support nötig
```

---

## ✅ Final Recommendation

### **🎯 Starte mit: PRO PLAN ($49/Monat)**

**Warum:**
1. ✅ Genug Screens (25) für alle 21 Pages + Buffer
2. ✅ Alle Features für erfolgreichen Launch
3. ✅ TestFlight für Beta Testing
4. ✅ Custom Domain (pixcapture.app)
5. ✅ Kann jederzeit upgraden
6. ✅ Beste Preis-Leistung

**Nicht empfohlen:**
- ❌ Starter: Zu limitiert
- ❌ Business: Zu teuer für Start
- ❌ Enterprise: Nicht nötig

---

## 📋 Nächste Schritte

1. **✅ Bravo Studio Account anlegen**
2. **✅ PRO Plan auswählen** ($49/Monat)
3. **✅ GitHub Repository verbinden**
4. **✅ Projekt importieren**
5. **✅ Build starten**
6. **✅ TestFlight Setup**
7. **✅ Launch! 🚀**

---

## 📞 Bravo Studio Support

Wenn du Fragen zu den Plans hast:
- Website: https://www.bravostudio.app/pricing
- Support: support@bravostudio.app
- Community: https://community.bravostudio.app/

---

## 🎉 Zusammenfassung

```
📱 pixcapture.app Screens:     21 Screens
📦 Empfohlener Plan:           PRO ($49/Monat)
💰 Erste 6 Monate Kosten:      $294
✅ Screen Limit:               25 (4 Buffer)
🚀 Launch Ready:               YES
```

**→ Wähle PRO Plan und leg los! 🚀**

---

**Last Updated:** 2025-11-06  
**Status:** Ready for Bravo Studio Plan Selection
