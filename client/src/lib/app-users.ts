/**
 * LocalStorage-basierte App-Nutzerverwaltung
 * Für Offline-First Mobile PWA
 */

import type { AppUser } from '@shared/app-user';

const STORAGE_KEY = 'app_users';
const ACTIVE_USER_KEY = 'active_user_id';

/**
 * Alle App-Nutzer abrufen
 */
export function getAppUsers(): AppUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load app users:', error);
    return [];
  }
}

/**
 * Einzelnen Nutzer abrufen
 */
export function getAppUser(userId: string): AppUser | null {
  const users = getAppUsers();
  return users.find(u => u.userId === userId) || null;
}

/**
 * Aktuell aktiven Nutzer abrufen
 */
export function getActiveAppUser(): AppUser | null {
  const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
  if (!activeUserId) return null;
  return getAppUser(activeUserId);
}

/**
 * Nutzer speichern/aktualisieren
 */
export function saveAppUser(user: AppUser): void {
  const users = getAppUsers();
  const existingIndex = users.findIndex(u => u.userId === user.userId);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/**
 * Nutzer als aktiv setzen
 */
export function setActiveAppUser(userId: string): void {
  const users = getAppUsers();
  
  // Deaktiviere alle anderen
  users.forEach(u => {
    u.isActive = (u.userId === userId);
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  localStorage.setItem(ACTIVE_USER_KEY, userId);
}

/**
 * Nutzer löschen
 */
export function deleteAppUser(userId: string): void {
  const users = getAppUsers();
  const filtered = users.filter(u => u.userId !== userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  
  // Falls gelöschter Nutzer aktiv war, lösche auch active_user_id
  const activeUserId = localStorage.getItem(ACTIVE_USER_KEY);
  if (activeUserId === userId) {
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

/**
 * Prüft ob ein user_code bereits existiert
 */
export function isUserCodeTaken(userCode: string): boolean {
  const users = getAppUsers();
  return users.some(u => u.userCode === userCode);
}
