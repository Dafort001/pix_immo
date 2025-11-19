import { db } from "./db";
import { services } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const serviceData = [
  // Photography
  { serviceCode: "F10", category: "photography", name: "Paket F10 – 10 Bilder", description: "Empfohlen für kleine Wohnungen bis ca. 60 m² (1–2 Zimmer). Es werden mehr Motive fotografiert, als im Paket enthalten sind. In der Online-Galerie wählen Sie Ihre 10 finalen Bilder aus. Weitere Bilder können Sie bei Bedarf gegen Aufpreis dazu buchen.", netPrice: 18000, notes: "Standardpaket für kleinere Objekte bis 60 m²" },
  { serviceCode: "F15", category: "photography", name: "Paket F15 – 15 Bilder", description: "Für typische Wohnungen oder kleinere Häuser bis ca. 200 m². Sie erhalten eine größere Motivauswahl und wählen daraus 15 finale Bilder. Zusätzliche Bilder können Sie später kostenpflichtig ergänzen.", netPrice: 21000, notes: "Ideal für mittlere Wohnungen bis 200 m²" },
  { serviceCode: "F20", category: "photography", name: "Paket F20 – 20 Bilder", description: "Für größere Wohnungen, Reihenhäuser oder Objekte mit vielen Raumvarianten (bis ca. 200 m²). Es werden mehr Motive aufgenommen, als im Paket enthalten sind. In der Galerie wählen Sie Ihre 20 finalen Bilder aus.", netPrice: 24000, notes: "Standardpaket für Exposés bis 200 m²" },
  { serviceCode: "F40", category: "photography", name: "Paket F40 – 40 Bilder", description: "Für große Häuser, Objekte mit mehreren Ebenen oder mehreren Wohneinheiten (z. B. Einliegerwohnung). Dieses Paket ist darauf ausgelegt, ein komplettes Haus mit allen Bereichen abzudecken. Wie bei allen Paketen wählen Sie Ihre finalen Bilder später in der Galerie aus.", netPrice: 32000, notes: "auf Anfrage anpassbar" },
  
  // Drone
  { serviceCode: "D04", category: "drone", name: "4 Drohnenfotos", description: "Lage- und Umfelddarstellung", netPrice: 15000, notes: "Einzelauftrag" },
  { serviceCode: "D04C", category: "drone", name: "4 Drohnenfotos im Kombipaket", description: "in Verbindung mit Fotopaket", netPrice: 10000, notes: "rabattierte Variante" },
  { serviceCode: "D10", category: "drone", name: "10 Drohnenfotos", description: "mehrere Perspektiven, höherer Aufwand", netPrice: 22000, notes: "nach Wetterlage" },
  { serviceCode: "DVI", category: "drone", name: "Drohnenvideo 1 min", description: "Außenaufnahmen Video", netPrice: 39900, notes: "ggf. Sondergenehmigung nötig" },
  
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
