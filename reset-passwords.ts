import { hashPassword } from "./server/auth";
import { db } from "./server/db";
import { users } from "@shared/schema";

async function resetAllPasswords() {
  const newPassword = "1234567Pass";
  const hashedPassword = await hashPassword(newPassword);
  
  console.log("\n🔐 Passwort-Reset für alle Benutzer");
  console.log("====================================\n");
  console.log(`Neues Passwort: ${newPassword}\n`);
  
  const result = await db
    .update(users)
    .set({ hashedPassword })
    .returning({ email: users.email, role: users.role });
  
  console.log(`✅ ${result.length} Benutzer-Passwörter aktualisiert:\n`);
  result.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
  
  console.log(`\n🔐 Login-Daten für alle Accounts:`);
  console.log(`   Passwort: ${newPassword}\n`);
}

resetAllPasswords()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("❌ Fehler:", err);
    process.exit(1);
  });
