import { db } from './db';
import { users, pixJobs } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedTestJobs() {
  console.log('🌱 Seeding test pix.immo jobs...');

  try {
    // Get admin user
    const [admin] = await db
      .select()
      .from(users)
      .where(eq(users.email, 'admin@piximmo.de'))
      .limit(1);

    if (!admin) {
      console.error('❌ Admin user not found. Run seed-admin.ts first.');
      process.exit(1);
    }

    // Create test jobs
    const testJobs = [
      {
        jobNumber: 'J-2024-TEST-001',
        userId: admin.id,
        source: 'pix.immo',
        customerName: 'Test Kunde GmbH',
        propertyName: 'Musterwohnung Hamburg Innenstadt',
        propertyAddress: 'Jungfernstieg 1, 20095 Hamburg',
        status: 'pending',
        workflowLocked: false,
        createdAt: Date.now(),
      },
      {
        jobNumber: 'J-2024-TEST-002',
        userId: admin.id,
        source: 'pix.immo',
        customerName: 'Immobilien Testmann',
        propertyName: 'Penthouse Elbphilharmonie',
        propertyAddress: 'Platz der Deutschen Einheit 1, 20457 Hamburg',
        status: 'in_progress',
        workflowLocked: true, // Locked job for testing lock-state
        createdAt: Date.now() - 86400000, // 1 day ago
      },
      {
        jobNumber: 'J-2024-TEST-003',
        userId: admin.id,
        source: 'pix.immo',
        customerName: 'Test AG',
        propertyName: 'Villa Blankenese',
        propertyAddress: 'Strandweg 50, 22587 Hamburg',
        status: 'pending',
        workflowLocked: false,
        createdAt: Date.now() - 172800000, // 2 days ago
      },
    ];

    for (const jobData of testJobs) {
      // Check if job already exists
      const [existing] = await db
        .select()
        .from(pixJobs)
        .where(eq(pixJobs.jobNumber, jobData.jobNumber))
        .limit(1);

      if (existing) {
        console.log(`⏭️  Job ${jobData.jobNumber} already exists, skipping`);
        continue;
      }

      await db.insert(pixJobs).values(jobData);
      console.log(`✅ Created test job: ${jobData.jobNumber} - ${jobData.propertyName}`);
    }

    console.log('\n🎉 Test jobs seeded successfully!');
    console.log('\nℹ️  You now have:');
    console.log('   - J-2024-TEST-001: Unlocked job for upload testing');
    console.log('   - J-2024-TEST-002: LOCKED job for lock-state testing');
    console.log('   - J-2024-TEST-003: Unlocked job for workflow testing');
    console.log('\n👉 Navigate to /admin/pix-jobs to see them');
    
  } catch (error) {
    console.error('❌ Error seeding test jobs:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedTestJobs();
