// lib/calendar.ts
// Google Calendar integration helpers

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

interface CalendarEvent {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: { email: string }[];
}

/**
 * Get a fresh access token using the refresh token
 */
async function getAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Token refresh failed:", error);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

/**
 * Check if a time slot is available in Google Calendar
 */
export async function checkAvailability(
  refreshToken: string,
  calendarId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return false;

  try {
    const params = new URLSearchParams({
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      items: JSON.stringify([{ id: calendarId }]),
    });

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy?${params}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: calendarId }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Free busy check failed:", error);
      return false;
    }

    const data = await response.json();
    const busySlots = data.calendars[calendarId]?.busy || [];
    
    // If no busy slots, time is available
    return busySlots.length === 0;
  } catch (error) {
    console.error("Error checking availability:", error);
    return false;
  }
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  refreshToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) {
    return { success: false, error: "Failed to get access token" };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        calendarId
      )}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: "America/Los_Angeles",
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: "America/Los_Angeles",
          },
          attendees: event.attendees,
          reminders: {
            useDefault: false,
            overrides: [
              { method: "email", minutes: 60 },
              { method: "popup", minutes: 10 },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Event creation failed:", error);
      return { success: false, error: "Failed to create event" };
    }

    const data = await response.json();
    return { success: true, eventId: data.id };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Unexpected error" };
  }
}

/**
 * Get available time slots for a given date
 * Returns array of { start, end } objects
 */
export async function getAvailableSlots(
  refreshToken: string,
  calendarId: string,
  date: Date,
  businessHours: { open: string; close: string; closed: boolean },
  durationMinutes: number = 60
): Promise<{ start: string; end: string }[]> {
  if (businessHours.closed) {
    return [];
  }

  const accessToken = await getAccessToken(refreshToken);
  if (!accessToken) return [];

  const dateStr = date.toISOString().split("T")[0];
  const startOfDay = new Date(`${dateStr}T${businessHours.open}`);
  const endOfDay = new Date(`${dateStr}T${businessHours.close}`);

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/freeBusy`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          items: [{ id: calendarId }],
        }),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const busySlots = data.calendars[calendarId]?.busy || [];

    // Generate available slots
    const slots: { start: string; end: string }[] = [];
    let currentTime = startOfDay;

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);
      
      // Check if this slot conflicts with any busy period
      const isAvailable = !busySlots.some((busy: any) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return (
          (currentTime >= busyStart && currentTime < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentTime <= busyStart && slotEnd >= busyEnd)
        );
      });

      if (isAvailable && slotEnd <= endOfDay) {
        slots.push({
          start: currentTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          end: slotEnd.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
        });
      }

      // Move to next slot (30 min increments)
      currentTime = new Date(currentTime.getTime() + 30 * 60000);
    }

    return slots;
  } catch (error) {
    console.error("Error getting available slots:", error);
    return [];
  }
}
