import { google } from 'googleapis';

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
  private static SLOT_DURATION_MINUTES = 60;

  static async getAvailableSlots(params: AvailableSlotsParams): Promise<TimeSlot[]> {
    const calendar = await getUncachableGoogleCalendarClient();
    const calendarId = params.calendarId || this.DEFAULT_CALENDAR_ID;
    const duration = params.duration || this.SLOT_DURATION_MINUTES;

    const requestedDate = new Date(params.date);
    const timeMin = new Date(requestedDate);
    timeMin.setHours(this.BUSINESS_HOURS_START, 0, 0, 0);
    
    const timeMax = new Date(requestedDate);
    timeMax.setHours(this.BUSINESS_HOURS_END, 0, 0, 0);

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

      slots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString(),
        available: !isBusy,
      });

      currentTime = new Date(currentTime.getTime() + duration * 60000);
    }

    return slots.filter(slot => slot.available);
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
