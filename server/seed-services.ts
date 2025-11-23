import { db } from "./db";
import { services } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const serviceData = [
  // Photography - New 5-tier package structure
  { serviceCode: "F10", category: "photography", name: "Mini-Paket – 10 Bilder", description: "Empfohlen für kleine Wohnungen bis ca. 60 m² (1–2 Zimmer). Es werden mehr Motive fotografiert, als im Paket enthalten sind. In der Online-Galerie wählen Sie Ihre 10 finalen Bilder aus. Weitere Bilder können Sie bei Bedarf gegen Aufpreis dazu buchen.", netPrice: 18000, notes: "Für kleine Wohnungen bis 60 m²" },
  { serviceCode: "F15", category: "photography", name: "Klein-Paket – 15 Bilder", description: "Für typische Wohnungen bis ca. 120 m². Sie erhalten eine größere Motivauswahl und wählen daraus 15 finale Bilder. Zusätzliche Bilder können Sie später kostenpflichtig ergänzen.", netPrice: 20000, notes: "Ideal für Wohnungen bis 120 m²" },
  { serviceCode: "F20", category: "photography", name: "Standard-Paket – 20 Bilder", description: "Für größere Wohnungen und Reihenhäuser bis ca. 200 m². Es werden mehr Motive aufgenommen, als im Paket enthalten sind. In der Galerie wählen Sie Ihre 20 finalen Bilder aus. Bei Wohnungen über 200 m² ist mindestens dieses Paket erforderlich.", netPrice: 22000, notes: "Mindestpaket für Objekte über 200 m²" },
  { serviceCode: "F25", category: "photography", name: "Plus-Paket – 25 Bilder", description: "Für große Wohnungen, Häuser oder Objekte mit vielen Räumen (bis ca. 250 m²). Umfangreiche Motivauswahl zur späteren Bildauswahl in der Galerie. Ideal für hochwertige Exposés.", netPrice: 24000, notes: "Für große Objekte bis 250 m²" },
  { serviceCode: "F30", category: "photography", name: "Premium-Paket – 30 Bilder", description: "Für sehr große Häuser, Villen oder Objekte mit mehreren Ebenen (bis ca. 300 m²). Maximale Motivvielfalt für umfassende Immobilienpräsentation. Wie bei allen Paketen wählen Sie Ihre finalen Bilder später in der Galerie aus.", netPrice: 28000, notes: "Für Objekte bis 300 m²" },
  { serviceCode: "F40", category: "photography", name: "Luxus-Paket – 40 Bilder", description: "Für außergewöhnlich große Objekte über 300 m², Mehrfamilienhäuser oder mehrere Wohneinheiten (z. B. Hauptwohnung + Einliegerwohnung). Einliegerwohnungen oder weitere Einheiten nach individueller Absprache (Aufpreis mind. 50€). Komplette Abdeckung aller Bereiche mit maximaler Bildauswahl.", netPrice: 32000, notes: "Für Objekte 300+ m² oder mehrere Einheiten" },
  
  // Drone
  { serviceCode: "D04", category: "drone", name: "Drohnenaufnahmen (Einzelbuchung)", description: "4 Drohnenfotos für Lage- und Umfelddarstellung als eigenständige Buchung ohne Fotopaket", netPrice: 20000, notes: "Einzelbuchung ohne Fotopaket" },
  { serviceCode: "D04C", category: "drone", name: "Drohnenaufnahmen (Kombipaket)", description: "4 Drohnenfotos in Verbindung mit einem Fotopaket – vergünstigter Preis bei gemeinsamer Buchung", netPrice: 10000, notes: "Aufschlag bei Kombination mit Fotopaket" },
  { serviceCode: "D10", category: "drone", name: "10 Drohnenfotos", description: "mehrere Perspektiven, höherer Aufwand", netPrice: 22000, notes: "nach Wetterlage" },
  { serviceCode: "DVI", category: "drone", name: "Drohnenvideo 1 min", description: "Außenaufnahmen Video", netPrice: 39900, notes: "ggf. Sondergenehmigung nötig" },
  
  // Content & Text Services
  { serviceCode: "ALT", category: "content", name: "Alt-Texte für KI-Bildsuche", description: "SEO-optimierte Alt-Texte für alle Bilder Ihres Pakets, ideal für bessere Auffindbarkeit in Bildersuchmaschinen und Barrierefreiheit. Automatisch generiert und manuell geprüft. Lieferung als CSV-Datei zur direkten Verwendung in Ihrem CRM (Fido, Propstack, onOffice, etc.).", netPrice: 1000, notes: "CSV-Export für CRM-Import (Fido, Propstack, etc.)" },
  { serviceCode: "EXP", category: "content", name: "Basis-Exposé Texterstellung", description: "Professioneller Exposé-Text für Ihre Immobilie basierend auf den Bildern und Objektdaten. Inkludiert Objektbeschreibung, Lage und Ausstattung. Wichtig: Alt-Texte werden für die KI-gestützte Texterstellung benötigt.", netPrice: 1500, notes: "Benötigt Alt-Texte (ALT) als Voraussetzung" },
  
  // Video
  { serviceCode: "V30", category: "video", name: "Video-Teaser 30 Sek.", description: "Kurzclip, Hoch/Querformat", netPrice: 19900, notes: "Social-Media-Version" },
  { serviceCode: "V60", category: "video", name: "Video 1 min Boden", description: "Innen-/Außenaufnahmen, kein Flug", netPrice: 39900, notes: "professionelles Video" },
  { serviceCode: "V61", category: "video", name: "Video 1 min Boden + Drohne", description: "kombiniert", netPrice: 69900, notes: "inkl. Schnitt und Farbkorrektur" },
  { serviceCode: "VSO", category: "video", name: "Social-Media-Slideshow", description: "aus vorhandenen Bildern", netPrice: 4900, notes: "3 Formate (Reels, Story, Post)" },
  
  // 360° Tours
  { serviceCode: "TML", category: "360tour", name: "MLS-Tour (Basis)", description: "360°-Tour zur Einbindung in CRM/MLS", netPrice: 10000, notes: "für FIO, onOffice, Propstack" },
  // TFX and THD deactivated - only TML is active
  // { serviceCode: "TFX", category: "360tour", name: "Erweiterte Tour", description: "interaktive Navigation, Hosting 6 Monate", netPrice: 23900, notes: "auf Wunsch mit Grundriss" },
  // { serviceCode: "THD", category: "360tour", name: "Hochauflösende Tour", description: "HD-Qualität, manuelles Stitching", netPrice: 34900, notes: "Premiumoption" },
  
  // Virtual Staging - Only available in gallery, not for booking
  // { serviceCode: "SBR", category: "staging", name: "Virtuelles Staging (Basisraum)", description: "nach Briefing + Moodboard", netPrice: null, priceNote: "€90 – €150", notes: "Preis je Raumgröße" },
  // { serviceCode: "SFX", category: "staging", name: "Komplettes Staging (Projekt)", description: "mehrere Räume, Abstimmung per Freigabe", netPrice: null, priceNote: "ab €300", notes: "individuelle Berechnung" },
  
  // Image Optimization - Only available in gallery, not for booking
  // { serviceCode: "B02", category: "optimization", name: "Erweiterte Bearbeitung", description: "Objektentfernung klein", netPrice: 480, notes: "manuell oder KI" },
  // { serviceCode: "B03", category: "optimization", name: "Expertenretusche", description: "komplexe Objektentfernung, Möbel etc.", netPrice: 2900, notes: "> 50 % Flächenänderung" },
  // { serviceCode: "BKI", category: "optimization", name: "KI-Optimierung", description: "automatische Bearbeitung über internes System", netPrice: 150, notes: "nur für pix.immo-Bilder" },
  
  // Travel - No longer separate services, included up to 40km, individual agreement beyond
  // { serviceCode: "AH", category: "travel", name: "Hamburg", description: "bis 30 km inklusive", netPrice: 0, notes: "Grundpreis enthalten" },
  // { serviceCode: "AEX", category: "travel", name: "Erweiterte Anfahrt", description: "> 30 km", netPrice: null, priceNote: "€0.80/km", notes: "Hin- und Rückweg" },
  // { serviceCode: "ARE", category: "travel", name: "Reise/Übernachtung", description: "nach Absprache", netPrice: null, priceNote: "auf Anfrage", notes: "individuell vereinbar" },
];

async function seedServices() {
  console.log("🌱 Seeding services from internal price list...");
  
  const timestamp = Date.now();
  let inserted = 0;
  let updated = 0;
  
  for (const service of serviceData) {
    // Check if service already exists
    const existing = await db
      .select()
      .from(services)
      .where(eq(services.serviceCode, service.serviceCode))
      .limit(1);

    if (existing.length > 0) {
      // Update existing service
      await db
        .update(services)
        .set({
          category: service.category,
          name: service.name,
          description: service.description || null,
          netPrice: service.netPrice || null,
          priceNote: service.priceNote || null,
          notes: service.notes || null,
          isActive: "true",
        })
        .where(eq(services.serviceCode, service.serviceCode));
      
      updated++;
      console.log(`✏️  Updated: ${service.serviceCode} - ${service.name}`);
    } else {
      // Insert new service
      await db.insert(services).values({
        id: randomUUID(),
        serviceCode: service.serviceCode,
        category: service.category,
        name: service.name,
        description: service.description || null,
        netPrice: service.netPrice || null,
        priceNote: service.priceNote || null,
        notes: service.notes || null,
        isActive: "true",
        createdAt: timestamp,
      });
      
      inserted++;
      console.log(`✅ Inserted: ${service.serviceCode} - ${service.name}`);
    }
  }
  
  console.log("\n📊 Import Summary:");
  console.log(`   ✅ Inserted: ${inserted}`);
  console.log(`   ✏️  Updated: ${updated}`);
  console.log(`   📦 Total: ${serviceData.length}`);
  console.log("\n🎉 Services import complete!");
  process.exit(0);
}

seedServices().catch(console.error);
