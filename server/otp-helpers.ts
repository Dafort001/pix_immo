/**
 * OTP Code Generation and Validation Helpers
 */

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// OTP Configuration
export const OTP_LENGTH = 6;
export const OTP_VALIDITY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5; // Max failed attempts before code is invalidated

/**
 * Generate a 6-digit OTP code
 * 
 * @returns 6-digit numeric string (e.g., "123456")
 */
export function generateOtpCode(): string {
  // Generate a random number between 000000 and 999999
  const code = Math.floor(Math.random() * 1000000).toString().padStart(OTP_LENGTH, "0");
  return code;
}

/**
 * Hash an OTP code using scrypt (same as password hashing)
 * 
 * @param code - Plain OTP code
 * @returns Hashed code with salt (format: "salt.hash")
 */
export async function hashOtpCode(code: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(code, salt, 64)) as Buffer;
  const hash = derivedKey.toString("hex");
  return `${salt}.${hash}`;
}

/**
 * Verify an OTP code against a hash
 * 
 * @param code - Plain OTP code to verify
 * @param storedHash - Hashed code from database (format: "salt.hash")
 * @returns true if code matches, false otherwise
 */
export async function verifyOtpCode(code: string, storedHash: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(".");
  if (!salt || !hash) {
    return false;
  }
  
  const derivedKey = (await scryptAsync(code, salt, 64)) as Buffer;
  const hashBuffer = Buffer.from(hash, "hex");
  
  return timingSafeEqual(derivedKey, hashBuffer);
}

/**
 * Generate OTP expiration timestamp
 * 
 * @returns Unix timestamp (in milliseconds) for OTP expiration
 */
export function generateOtpExpiration(): number {
  return Date.now() + OTP_VALIDITY_MS;
}

/**
 * Normalize email address for consistent comparison
 * 
 * @param email - Raw email address
 * @returns Normalized email (lowercase, trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
