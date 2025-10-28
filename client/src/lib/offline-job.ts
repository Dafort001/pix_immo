/**
 * Offline-Job-Creation mit Sync-Queue
 * Erstellt Jobs lokal und synchronisiert automatisch
 */

import { enqueue } from '@/lib/sync-queue';
import { ulid } from 'ulid';
import type { Job } from '@shared/schema';

interface CreateJobPayload {
  jobNumber: string;
  userId: string;
  propertyName: string;
  propertyAddress?: string;
  selectedUserId?: string;
  selectedUserInitials?: string;
  selectedUserCode?: string;
}

/**
 * Erstellt Job offline und fügt zur Sync-Queue hinzu
 * Returns: Local Job object with local_id
 */
export function createJobOffline(payload: CreateJobPayload): Partial<Job> & { localId: string; synced: boolean } {
  const localId = ulid();
  
  // Queue job for sync
  const queueItem = enqueue('job', {
    ...payload,
    localId, // Server kann das deduplizieren via localId
  });

  // Return local job object (local_only status)
  const localJob: Partial<Job> & { localId: string; synced: boolean } = {
    id: localId, // Temporäre local ID
    localId: queueItem.localId,
    jobNumber: payload.jobNumber,
    userId: payload.userId,
    propertyName: payload.propertyName,
    propertyAddress: payload.propertyAddress || null,
    status: 'local_only' as any, // Custom status für offline jobs
    selectedUserId: payload.selectedUserId || null,
    selectedUserInitials: payload.selectedUserInitials || null,
    selectedUserCode: payload.selectedUserCode || null,
    synced: false,
    createdAt: queueItem.createdAt,
  };

  return localJob;
}

/**
 * Speichert lokale Jobs in localStorage (zusätzlich zur Queue)
 * So können wir sie in der Job-Liste anzeigen
 */
const LOCAL_JOBS_KEY = 'pix_local_jobs';

export function saveLocalJob(job: Partial<Job> & { localId: string; synced: boolean }): void {
  try {
    const jobs = getLocalJobs();
    jobs.push(job);
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
  } catch (error) {
    console.error('[OfflineJob] Save error:', error);
  }
}

export function getLocalJobs(): (Partial<Job> & { localId: string; synced: boolean })[] {
  try {
    const data = localStorage.getItem(LOCAL_JOBS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[OfflineJob] Load error:', error);
    return [];
  }
}

export function updateLocalJobAfterSync(localId: string, serverId: string): void {
  try {
    const jobs = getLocalJobs();
    const job = jobs.find(j => j.localId === localId);
    
    if (job) {
      job.id = serverId;
      job.synced = true;
      job.status = 'created' as any; // Reset to normal status
      localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
    }
  } catch (error) {
    console.error('[OfflineJob] Update error:', error);
  }
}

export function removeLocalJob(localId: string): void {
  try {
    const jobs = getLocalJobs();
    const filtered = jobs.filter(j => j.localId !== localId);
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('[OfflineJob] Remove error:', error);
  }
}
