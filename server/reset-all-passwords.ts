import { hashPassword } from "./auth";
import { db } from "./db";
import { users } from "@shared/schema";

async function resetAllPasswords() {
  const newPassword = "Test2025!";
  
  try {
    console.log("🔄 Resetting all user passwords...\n");
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Get all users first to show them
    const allUsers = await db.select({
      email: users.email,
      role: users.role
    }).from(users);
    
    // Update all users with new password
    await db.update(users).set({ hashedPassword });
    
    console.log("✅ All passwords have been reset!\n");
    console.log("New password for all accounts:", newPassword);
    console.log("\n📋 User accounts:");
    console.log("─".repeat(60));
    
    allUsers.forEach(user => {
      console.log(`Email: ${user.email.padEnd(40)} Role: ${user.role}`);
    });
    
    console.log("─".repeat(60));
    console.log(`\n✅ Total: ${allUsers.length} accounts updated`);
    console.log("\n⚠️  Please change passwords after login for security!");
    
  } catch (error) {
    console.error("❌ Error resetting passwords:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

resetAllPasswords();
