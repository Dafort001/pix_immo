/**
 * HALT B1 - Workers Database Layer
 * Drizzle ORM setup for Cloudflare Workers with Neon Postgres
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

/**
 * Create database client for Workers
 */
export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

/**
 * Storage operations for B1a routes
 */
export class WorkerStorage {
  constructor(private db: ReturnType<typeof createDb>) {}

  /**
   * GET /api/shoots/:id/stacks
   */
  async getShootStacks(shootId: string) {
    return await this.db
      .select()
      .from(schema.stacks)
      .where(eq(schema.stacks.shootId, shootId));
  }

  /**
   * GET /api/shoots/:id/images
   */
  async getShootImages(shootId: string) {
    return await this.db
      .select()
      .from(schema.images)
      .where(eq(schema.images.shootId, shootId));
  }

  /**
   * GET /api/jobs
   * TODO: Add auth - filter by userId for clients, show all for admins
   */
  async getAllJobs() {
    return await this.db.select().from(schema.jobs);
  }

  /**
   * GET /api/jobs (filtered by userId for clients)
   */
  async getUserJobs(userId: string) {
    return await this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.userId, userId));
  }

  /**
   * GET /api/jobs/:id
   */
  async getJob(id: string) {
    const [job] = await this.db
      .select()
      .from(schema.jobs)
      .where(eq(schema.jobs.id, id));
    return job || undefined;
  }

  /**
   * GET /api/shoots/:id (for validation)
   */
  async getShoot(id: string) {
    const [shoot] = await this.db
      .select()
      .from(schema.shoots)
      .where(eq(schema.shoots.id, id));
    return shoot || undefined;
  }
}
