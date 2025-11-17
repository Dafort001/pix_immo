import { db } from "./db";
import { storage } from "./storage";
import { hashPassword } from "./auth";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  console.log("\n🌱 Admin Seed Script (ENV-basiert)");
  console.log("===================================\n");

  const email = process.env.ADMIN_EMAIL || "admin@piximmo.de";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠️  Warnung: ADMIN_EMAIL oder ADMIN_PASSWORD nicht in ENV gesetzt"
    );
    console.warn("   Verwende Default-Werte (NICHT für Production!):\n");
    console.warn(`   Email:    ${email}`);
    console.warn(`   Password: ${password}\n`);
  }

  try {
    const existing = await storage.getUserByEmail(email);

    if (existing) {
      if (existing.role === "admin") {
        console.log(`✅ Admin-Account existiert bereits: ${email}`);
        console.log(`   Rolle: ${existing.role}`);
        console.log(`   User-ID: ${existing.id}\n`);
        
        // Optional: Update password to ensure it matches ENV
        const hashedPassword = await hashPassword(password);
        await storage.updateUserPassword(existing.id, hashedPassword);
        console.log(`🔄 Passwort auf ENV-Variable synchronisiert\n`);
        
        return;
      } else {
        console.log(`🔄 User ${email} existiert mit Rolle "${existing.role}"`);
        console.log(`   Promote zu Admin...\n`);

        // Update password and role
        const hashedPassword = await hashPassword(password);
        await storage.updateUserPassword(existing.id, hashedPassword);
        await db.update(users)
          .set({ role: "admin" })
          .where(eq(users.id, existing.id));

        console.log(`✅ User erfolgreich zu Admin promoted: ${email}`);
        console.log(`   User-ID: ${existing.id}\n`);
        return;
      }
    }

    console.log(`🆕 Erstelle neuen Admin-Account: ${email}\n`);

    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser(email, hashedPassword);

    // Update role to admin (createUser creates "client" by default)
    await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));

    console.log(`✅ Admin-Account erfolgreich erstellt!`);
    console.log(`   Email:   ${email}`);
    console.log(`   Rolle:   admin`);
    console.log(`   User-ID: ${user.id}\n`);

    console.log(`🔐 Login-Daten:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}\n`);
  } catch (error) {
    console.error("❌ Admin-Seeding fehlgeschlagen:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
