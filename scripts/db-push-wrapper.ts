#!/usr/bin/env tsx
/**
 * Wrapper for db:push that validates database schema exists
 * Used by Replit publishing to verify migrations
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set');
  process.exit(1);
}

async function checkSchema() {
  console.log('🔄 Validating database schema...');
  
  try {
    const sql = neon(DATABASE_URL);
    
    // Check if key tables exist
    const result = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'jobs', 'shoots', 'images')
    `;
    
    const tableCount = parseInt(result[0].count as string);
    
    if (tableCount >= 5) {
      console.log(`✅ Database schema validated (${tableCount}/5 core tables exist)`);
      process.exit(0);
    } else {
      console.error(`❌ Database schema incomplete (${tableCount}/5 core tables exist)`);
      console.error('Run: npm run db:generate && tsx scripts/migrate.ts');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Schema validation failed:', error);
    process.exit(1);
  }
}

checkSchema();
