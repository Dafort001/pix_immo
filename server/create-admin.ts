import { hashPassword } from "./auth";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = "admin@pix.immo";
  const password = "Admin2025!";
  
  try {
    // Check if admin already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log("✅ Admin user already exists:", email);
      console.log("Role:", existingUser.role);
      
      // Update role to admin if it's not
      if (existingUser.role !== "admin") {
        await db.update(users)
          .set({ role: "admin" })
          .where(eq(users.id, existingUser.id));
        console.log("✅ Updated user role to 'admin'");
      }
      
      return;
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create admin user
    const user = await storage.createUser(email, hashedPassword);
    
    // Update role to admin
    await db.update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));
    
    console.log("✅ Admin user created successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Role: admin");
    console.log("\nPlease change the password after first login.");
    
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

createAdmin();
