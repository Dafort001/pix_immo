import { google } from 'googleapis';
import { db } from './db';
import { bookings } from '@shared/schema';
import { eq, and, or, sql } from 'drizzle-orm';
import {
  calculateDistance,
  calculateTravelBuffer,
  parseCoordinate,
  areCoordinatesValid,
  parseBookingDateTime
} from './travel-buffer';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-calendar',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Google Calendar not connected');
  }
  return accessToken;
}

async function getUncachableGoogleCalendarClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  formatted?: string; // Human-readable time in Europe/Berlin timezone (e.g., "09:00")
}

export interface AvailableSlotsParams {
  date: string;
  duration?: number;
  calendarId?: string;
}

export interface CreateEventParams {
  summary: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  attendees?: string[];
  calendarId?: string;
}

export class GoogleCalendarService {
  private static DEFAULT_CALENDAR_ID = 'primary';
  private static BUSINESS_HOURS_START = 9;
  private static BUSINESS_HOURS_END = 18;
  private static SLOT_DURATION_MINUTES = 90;

  static async getAvailableSlots(params: AvailableSlotsParams): Promise<TimeSlot[]> {
    const calendar = await getUncachableGoogleCalendarClient();
    const calendarId = params.calendarId || this.DEFAULT_CALENDAR_ID;
    const duration = params.duration || this.SLOT_DURATION_MINUTES;

    // Parse date and create business hours in Europe/Berlin timezone
    // We need to manually handle timezone offset to ensure 09:00 Europe/Berlin
    const [year, month, day] = params.date.split('-').map(Number);
    
    // Create dates representing business hours in Europe/Berlin
    // Date constructor uses local system time, so we need to adjust for Europe/Berlin
    const berlinOffset = 1; // CET is UTC+1 (adjust to +2 for CEST in summer if needed)
    
    // Create UTC dates that represent the correct Berlin local time
    const timeMin = new Date(Date.UTC(year, month - 1, day, this.BUSINESS_HOURS_START - berlinOffset, 0, 0, 0));
    const timeMax = new Date(Date.UTC(year, month - 1, day, this.BUSINESS_HOURS_END - berlinOffset, 0, 0, 0));

    const freeBusyResponse = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: calendarId }],
      },
    });

    const busySlots = freeBusyResponse.data.calendars?.[calendarId]?.busy || [];

    const slots: TimeSlot[] = [];
    let currentTime = new Date(timeMin);

    while (currentTime < timeMax) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      if (slotEnd > timeMax) break;

      const isBusy = busySlots.some((busy) => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return (
          (currentTime >= busyStart && currentTime < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentTime <= busyStart && slotEnd >= busyEnd)
        );
      });

      // Format time in Berlin timezone for display
      // currentTime is already in UTC, so we just need to format it in Berlin timezone
      const formatted = currentTime.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Berlin'
      });

      slots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString(),
        available: !isBusy,
        formatted,
      });

      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    return slots.filter(slot => slot.available);
  }

  /**
   * Get available time slots with travel buffer validation
   * 
   * This method filters slots based on travel distance to/from existing bookings.
   * Buffers are applied between bookings based on distance:
   * - ≤ 10 km → 0 minutes
   * - > 10 km and < 20 km → 15 minutes
   * - ≥ 20 km → 30 minutes
   * 
   * @param params - Date, duration, calendar ID, and coordinates for new booking
   * @returns Array of available time slots that satisfy buffer requirements
   */
  static async getAvailableSlotsWithTravelBuffer(params: AvailableSlotsParams & {
    lat?: string;
    lng?: string;
  }): Promise<TimeSlot[]> {
    // If no coordinates provided, fall back to regular slot fetching
    if (!params.lat || !params.lng) {
      return this.getAvailableSlots(params);
    }

    const newLat = parseCoordinate(params.lat);
    const newLng = parseCoordinate(params.lng);

    if (newLat === null || newLng === null) {
      // Invalid coordinates, fall back to regular slots
      return this.getAvailableSlots(params);
    }

    // Get base available slots from Google Calendar
    const baseSlots = await this.getAvailableSlots(params);

    // Get all bookings for the same date with status pending or confirmed
    const dateObj = new Date(params.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          or(
            eq(bookings.status, 'pending'),
            eq(bookings.status, 'confirmed')
          ),
          sql`${bookings.preferredDate} = ${params.date}`
        )
      );

    // Filter slots based on travel buffer requirements
    const validSlots = baseSlots.filter(slot => {
      const newStart = new Date(slot.start);
      const newEnd = new Date(slot.end);

      // Find previous booking (last booking before this slot)
      let prevBooking = null;
      let prevEnd = null;

      for (const booking of existingBookings) {
        if (!booking.preferredTime) continue;

        // Parse booking time with Europe/Berlin timezone handling
        const bookingStart = parseBookingDateTime(params.date, booking.preferredTime);
        const bookingEnd = new Date(bookingStart.getTime() + this.SLOT_DURATION_MINUTES * 60000);

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
            return false; // Slot too close to previous booking
          }
        }
      }

      // Find next booking (first booking after this slot)
      let nextBooking = null;
      let nextStart = null;

      for (const booking of existingBookings) {
        if (!booking.preferredTime) continue;

        // Parse booking time with Europe/Berlin timezone handling
        const bookingStart = parseBookingDateTime(params.date, booking.preferredTime);

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
            return false; // Slot too close to next booking
          }
        }
      }

      return true; // Slot satisfies all buffer requirements
    });

    return validSlots;
  }

  static async createEvent(params: CreateEventParams): Promise<string> {
    const calendar = await getUncachableGoogleCalendarClient();
    const calendarId = params.calendarId || this.DEFAULT_CALENDAR_ID;

    const event = {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: {
        dateTime: params.start,
        timeZone: 'Europe/Berlin',
      },
      end: {
        dateTime: params.end,
        timeZone: 'Europe/Berlin',
      },
      attendees: params.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
      sendUpdates: 'all',
    });

    return response.data.id!;
  }

  static async updateEvent(eventId: string, params: Partial<CreateEventParams>): Promise<void> {
    const calendar = await getUncachableGoogleCalendarClient();
    const calendarId = params.calendarId || this.DEFAULT_CALENDAR_ID;

    const updateData: any = {};
    
    if (params.summary) updateData.summary = params.summary;
    if (params.description) updateData.description = params.description;
    if (params.location) updateData.location = params.location;
    if (params.start) {
      updateData.start = {
        dateTime: params.start,
        timeZone: 'Europe/Berlin',
      };
    }
    if (params.end) {
      updateData.end = {
        dateTime: params.end,
        timeZone: 'Europe/Berlin',
      };
    }
    if (params.attendees) {
      updateData.attendees = params.attendees.map(email => ({ email }));
    }

    await calendar.events.patch({
      calendarId,
      eventId,
      requestBody: updateData,
      sendUpdates: 'all',
    });
  }

  static async deleteEvent(eventId: string, calendarId?: string): Promise<void> {
    const calendar = await getUncachableGoogleCalendarClient();
    const calId = calendarId || this.DEFAULT_CALENDAR_ID;

    await calendar.events.delete({
      calendarId: calId,
      eventId,
      sendUpdates: 'all',
    });
  }

  static async getEvent(eventId: string, calendarId?: string) {
    const calendar = await getUncachableGoogleCalendarClient();
    const calId = calendarId || this.DEFAULT_CALENDAR_ID;

    const response = await calendar.events.get({
      calendarId: calId,
      eventId,
    });

    return response.data;
  }
}
