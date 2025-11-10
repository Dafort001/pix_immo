import { hashPassword } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";
import { ulid } from "ulid";

async function createTestAdmin() {
  const email = "admin@example.com";
  const password = "admin123";
  
  console.log("Creating test admin user...");
  
  try {
    const hashedPassword = await hashPassword(password);
    
    await db.insert(users).values({
      id: ulid(),
      email,
      hashedPassword,
      role: "admin",
      createdAt: Date.now(),
      credits: 0,
    });
    
    console.log(`✓ Test admin created: ${email} / ${password}`);
  } catch (error) {
    console.error("Error creating test admin:", error);
  }
  
  process.exit(0);
}

createTestAdmin();
