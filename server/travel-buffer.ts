/**
 * Travel Buffer v1 - Distance and Buffer Calculations for Booking Slots
 * 
 * Implements logic for calculating travel time buffers between bookings based on distance.
 * Slots remain 90 minutes long; buffers are added on top for availability checks.
 */

/**
 * Convert a date string (YYYY-MM-DD) and time string (HH:MM) to a UTC Date
 * that represents the correct Europe/Berlin local time.
 * 
 * This matches the timezone handling used in GoogleCalendarService.getAvailableSlots()
 * 
 * @param dateStr - Date string in format YYYY-MM-DD
 * @param timeStr - Time string in format HH:MM
 * @returns UTC Date object representing the Berlin local time
 */
export function parseBookingDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Match the timezone handling from GoogleCalendarService
  // CET is UTC+1 (should be UTC+2 for CEST in summer, but matching existing code)
  const berlinOffset = 1;
  
  // Create UTC date that represents the correct Berlin local time
  return new Date(Date.UTC(year, month - 1, day, hours - berlinOffset, minutes, 0, 0));
}

/**
 * Calculate distance between two coordinates using Haversine formula (great-circle distance)
 * Returns distance in kilometers (Luftlinie / as the crow flies)
 * 
 * @param lat1 - Latitude of first point (in degrees)
 * @param lng1 - Longitude of first point (in degrees)
 * @param lat2 - Latitude of second point (in degrees)
 * @param lng2 - Longitude of second point (in degrees)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Calculate required travel buffer in minutes based on distance
 * 
 * Distance classes (km, Luftlinie):
 * - ≤ 10 km → 0 minutes buffer
 * - > 10 km and < 20 km → 15 minutes buffer
 * - ≥ 20 km → 30 minutes buffer
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Buffer time in minutes
 */
export function calculateTravelBuffer(distanceKm: number): number {
  if (distanceKm <= 10) {
    return 0;
  } else if (distanceKm < 20) {
    return 15;
  } else {
    return 30;
  }
}

/**
 * Parse lat/lng from string format (as stored in DB) to number
 * Handles null/undefined gracefully
 */
export function parseCoordinate(coord: string | null | undefined): number | null {
  if (!coord) return null;
  const parsed = parseFloat(coord);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Check if coordinates are valid for distance calculation
 */
export function areCoordinatesValid(
  lat1: number | null,
  lng1: number | null,
  lat2: number | null,
  lng2: number | null
): boolean {
  return (
    lat1 !== null &&
    lng1 !== null &&
    lat2 !== null &&
    lng2 !== null &&
    !isNaN(lat1) &&
    !isNaN(lng1) &&
    !isNaN(lat2) &&
    !isNaN(lng2)
  );
}

/**
 * Booking interface for validation
 */
export interface BookingForValidation {
  preferredDate?: string;
  preferredTime?: string;
  addressLat?: string | null;
  addressLng?: string | null;
  status: string;
}

/**
 * Validate if a new booking satisfies travel buffer requirements
 * 
 * @param newBooking - The new booking to validate
 * @param existingBookings - All existing bookings for the same date
 * @param slotDurationMinutes - Duration of booking slots (default: 90)
 * @returns { valid: boolean, error?: string } - Validation result
 */
export function validateBookingTravelBuffer(
  newBooking: {
    preferredDate: string;
    preferredTime: string;
    addressLat?: string | null;
    addressLng?: string | null;
  },
  existingBookings: BookingForValidation[],
  slotDurationMinutes: number = 90
): { valid: boolean; error?: string } {
  // Parse new booking coordinates
  const newLat = parseCoordinate(newBooking.addressLat);
  const newLng = parseCoordinate(newBooking.addressLng);

  if (newLat === null || newLng === null) {
    // If no valid coordinates, skip buffer validation
    // (allow booking but without distance-based checks)
    return { valid: true };
  }

  // Parse new booking time with Europe/Berlin timezone handling
  const newStart = parseBookingDateTime(newBooking.preferredDate, newBooking.preferredTime);
  const newEnd = new Date(newStart.getTime() + slotDurationMinutes * 60000);

  // Find previous booking (last booking before this slot)
  let prevBooking: BookingForValidation | null = null;
  let prevEnd: Date | null = null;

  for (const booking of existingBookings) {
    if (!booking.preferredTime || !booking.preferredDate) continue;
    if (booking.preferredDate !== newBooking.preferredDate) continue;

    // Parse booking time with Europe/Berlin timezone handling
    const bookingStart = parseBookingDateTime(booking.preferredDate, booking.preferredTime);
    const bookingEnd = new Date(bookingStart.getTime() + slotDurationMinutes * 60000);

    // Check if this booking ends before the new slot starts
    if (bookingEnd <= newStart) {
      if (!prevEnd || bookingEnd > prevEnd) {
        prevBooking = booking;
        prevEnd = bookingEnd;
      }
    }
  }

  // Check buffer with previous booking
  if (prevBooking && prevEnd) {
    const prevLat = parseCoordinate(prevBooking.addressLat);
    const prevLng = parseCoordinate(prevBooking.addressLng);

    if (areCoordinatesValid(prevLat, prevLng, newLat, newLng)) {
      const distance = calculateDistance(prevLat!, prevLng!, newLat, newLng);
      const buffer = calculateTravelBuffer(distance);
      const requiredStart = new Date(prevEnd.getTime() + buffer * 60000);

      if (newStart < requiredStart) {
        const bufferMinutes = Math.ceil((requiredStart.getTime() - newStart.getTime()) / 60000);
        return {
          valid: false,
          error: `Zu kurzer Abstand zur vorherigen Buchung. Benötigte Reisezeit-Puffer: ${buffer} Minuten (Distanz: ${distance.toFixed(1)} km). Frühester möglicher Beginn: ${requiredStart.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}`
        };
      }
    }
  }

  // Find next booking (first booking after this slot)
  let nextBooking: BookingForValidation | null = null;
  let nextStart: Date | null = null;

  for (const booking of existingBookings) {
    if (!booking.preferredTime || !booking.preferredDate) continue;
    if (booking.preferredDate !== newBooking.preferredDate) continue;

    // Parse booking time with Europe/Berlin timezone handling
    const bookingStart = parseBookingDateTime(booking.preferredDate, booking.preferredTime);

    // Check if this booking starts after the new slot ends
    if (bookingStart >= newEnd) {
      if (!nextStart || bookingStart < nextStart) {
        nextBooking = booking;
        nextStart = bookingStart;
      }
    }
  }

  // Check buffer with next booking
  if (nextBooking && nextStart) {
    const nextLat = parseCoordinate(nextBooking.addressLat);
    const nextLng = parseCoordinate(nextBooking.addressLng);

    if (areCoordinatesValid(newLat, newLng, nextLat, nextLng)) {
      const distance = calculateDistance(newLat, newLng, nextLat!, nextLng!);
      const buffer = calculateTravelBuffer(distance);
      const requiredEnd = new Date(nextStart.getTime() - buffer * 60000);

      if (newEnd > requiredEnd) {
        return {
          valid: false,
          error: `Zu kurzer Abstand zur nächsten Buchung. Benötigte Reisezeit-Puffer: ${buffer} Minuten (Distanz: ${distance.toFixed(1)} km). Spätestes mögliches Ende: ${requiredEnd.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' })}`
        };
      }
    }
  }

  return { valid: true };
}
