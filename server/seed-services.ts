import { db } from "./db";
import { services } from "@shared/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";

const serviceData = [
  // Photography
  { serviceCode: "F10", category: "photography", name: "Fotopaket 10 Bilder", description: "Innen- und Außenaufnahmen, Auswahl + Bearbeitung", netPrice: 18000, notes: "Standardpaket für kleinere Objekte" },
  { serviceCode: "F15", category: "photography", name: "Fotopaket 15 Bilder", description: "erweiterter Umfang, Innen + Außen", netPrice: 21000, notes: "Ideal für mittlere Wohnungen" },
  { serviceCode: "F20", category: "photography", name: "Fotopaket 20 Bilder", description: "umfangreiches Shooting, inkl. Detailaufnahmen", netPrice: 24000, notes: "Standardpaket für Exposés" },
  { serviceCode: "F40", category: "photography", name: "Fotopaket 40 Bilder", description: "große Objekte oder Mehrfamilienhäuser", netPrice: 32000, notes: "auf Anfrage anpassbar" },
  { serviceCode: "FEX", category: "photography", name: "Zusatzfoto (einzeln)", description: "je weiteres Bild außerhalb des Pakets", netPrice: 900, notes: "falls Nachbestellung erfolgt" },
  
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
