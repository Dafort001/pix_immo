import { db } from "./db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

function generateId(): string {
  return randomBytes(16).toString("hex");
}

async function seedUsers() {
  console.log("🌱 Seeding users...");

  const now = Date.now();

  // Admin account
  const adminPassword = await hashPassword("Admin123!");
  await db.insert(users).values({
    id: generateId(),
    email: "janjira@pix.immo",
    hashedPassword: adminPassword,
    firstName: "Janjira",
    lastName: "Admin",
    company: "pix.immo",
    phone: null,
    role: "admin",
    emailVerifiedAt: now, // Admin is pre-verified
    requiresPasswordMigration: false,
    createdAt: now,
  });
  console.log("✅ Admin account created: janjira@pix.immo");

  // Test customer accounts
  const testPassword = await hashPassword("Test123!");
  
  for (let i = 1; i <= 5; i++) {
    await db.insert(users).values({
      id: generateId(),
      email: `Franz${i}@franz.de`,
      hashedPassword: testPassword,
      firstName: "Franz",
      lastName: `Testuser ${i}`,
      company: null,
      phone: null,
      role: "client",
      emailVerifiedAt: now, // Test accounts are pre-verified
      requiresPasswordMigration: false,
      createdAt: now,
    });
    console.log(`✅ Test account created: Franz${i}@franz.de`);
  }

  console.log("\n🎉 User seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin: janjira@pix.immo / Admin123!");
  console.log("  Test:  Franz1@franz.de / Test123! (same for Franz2-5)");
}

seedUsers()
  .then(() => {
    console.log("✅ Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
