import { db } from "./db";
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seedClient() {
  console.log("\n🌱 Client User Seed Script");
  console.log("===================================\n");

  const email = process.env.CLIENT_EMAIL || "mail@pix.immo";
  const password = process.env.CLIENT_PASSWORD || "Client123!";

  if (!process.env.CLIENT_EMAIL || !process.env.CLIENT_PASSWORD) {
    console.warn(
      "⚠️  Warnung: CLIENT_EMAIL oder CLIENT_PASSWORD nicht in ENV gesetzt"
    );
    console.warn("   Verwende Default-Werte:\n");
    console.warn(`   Email:    ${email}`);
    console.warn(`   Password: ${password}\n`);
  }

  try {
    const existing = await storage.getUserByEmail(email);

    if (existing) {
      console.log(`✅ Client-Account existiert bereits: ${email}`);
      console.log(`   Rolle: ${existing.role}`);
      console.log(`   User-ID: ${existing.id}\n`);
      
      // Update password to ensure it matches ENV
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(existing.id, hashedPassword);
      console.log(`🔄 Passwort auf ENV-Variable synchronisiert\n`);
      
      console.log(`🔐 Login-Daten:`);
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${password}\n`);
      return;
    }

    console.log(`🆕 Erstelle neuen Client-Account: ${email}\n`);

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser(email, hashedPassword);

    console.log(`✅ Client-Account erfolgreich erstellt!`);
    console.log(`   Email:   ${email}`);
    console.log(`   Rolle:   ${user.role}`);
    console.log(`   User-ID: ${user.id}\n`);

    console.log(`🔐 Login-Daten:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}\n`);
  } catch (error) {
    console.error("❌ Client-Seeding fehlgeschlagen:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedClient();
