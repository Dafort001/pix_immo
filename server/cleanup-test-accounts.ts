import { db } from "./db";
import { users, sessions, refreshTokens, passwordResetTokens } from "@shared/schema";
import { eq, or, like, notInArray } from "drizzle-orm";

async function cleanupTestAccounts() {
  try {
    console.log("🔍 Analyzing user accounts...\n");
    
    // Get all users
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      role: users.role
    }).from(users);
    
    // Define accounts to keep (productive accounts)
    const keepEmails = [
      'admin@pix.immo',           // Main admin account
      'demo@pix.immo',            // Demo account
      'mail@pix.immo',            // Your email
      'mail@danielfortmann.com'   // Your personal email
    ];
    
    // Separate accounts
    const keepAccounts = allUsers.filter(u => keepEmails.includes(u.email));
    const deleteAccounts = allUsers.filter(u => !keepEmails.includes(u.email));
    
    console.log("✅ Accounts to KEEP:");
    console.log("─".repeat(60));
    keepAccounts.forEach(user => {
      console.log(`  ${user.email.padEnd(40)} [${user.role}]`);
    });
    
    console.log("\n🗑️  Accounts to DELETE:");
    console.log("─".repeat(60));
    deleteAccounts.forEach(user => {
      console.log(`  ${user.email.padEnd(40)} [${user.role}]`);
    });
    
    console.log("\n🔄 Deleting test accounts and their data...\n");
    
    const deleteIds = deleteAccounts.map(u => u.id);
    
    if (deleteIds.length === 0) {
      console.log("✅ No accounts to delete!");
      return;
    }
    
    // Delete related data first (cascading is handled by DB, but we can clean up explicitly)
    console.log("  → Deleting sessions...");
    await db.delete(sessions).where(
      deleteIds.length === 1 
        ? eq(sessions.userId, deleteIds[0])
        : notInArray(sessions.userId, keepAccounts.map(u => u.id))
    );
    
    console.log("  → Deleting refresh tokens...");
    await db.delete(refreshTokens).where(
      deleteIds.length === 1
        ? eq(refreshTokens.userId, deleteIds[0])
        : notInArray(refreshTokens.userId, keepAccounts.map(u => u.id))
    );
    
    console.log("  → Deleting password reset tokens...");
    await db.delete(passwordResetTokens).where(
      deleteIds.length === 1
        ? eq(passwordResetTokens.userId, deleteIds[0])
        : notInArray(passwordResetTokens.userId, keepAccounts.map(u => u.id))
    );
    
    console.log("  → Deleting user accounts...");
    await db.delete(users).where(
      deleteIds.length === 1
        ? eq(users.id, deleteIds[0])
        : notInArray(users.id, keepAccounts.map(u => u.id))
    );
    
    console.log("\n✅ Cleanup complete!\n");
    console.log("📊 Summary:");
    console.log("─".repeat(60));
    console.log(`  Accounts kept:    ${keepAccounts.length}`);
    console.log(`  Accounts deleted: ${deleteAccounts.length}`);
    console.log("─".repeat(60));
    
    console.log("\n✅ Remaining accounts:");
    keepAccounts.forEach(user => {
      console.log(`  • ${user.email} (${user.role})`);
    });
    
    console.log("\n🔑 All accounts use password: Test2025!");
    
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

cleanupTestAccounts();
