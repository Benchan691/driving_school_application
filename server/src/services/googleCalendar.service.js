import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the correct path to credentials.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- MODIFIED: Path adjusted for new directory structure
const CREDENTIALS_PATH = path.join(__dirname, '..', '..', 'credentials.json');

// --- MODIFIED: Corrected scope to allow creating/editing events
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: SCOPES,
});

const calendar = google.calendar({ version: 'v3', auth });

/**
 * Checks if a given time slot is free on Google Calendar.
 * @param {string} startTime - The start of the time slot in ISO 8601 format.
 * @param {string} endTime - The end of the time slot in ISO 8601 format.
 * @returns {Promise<boolean>} - True if the slot is available, false otherwise.
 */
export const isTimeSlotAvailable = async (startTime, endTime) => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      throw new Error('Google Calendar ID is not configured in .env file.');
    }

    console.log(calendarId)

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startTime,
      timeMax: endTime,
      maxResults: 1,
      singleEvents: true,
    });

    return response.data.items.length === 0;
  } catch (error) {
    console.log(error)
    console.error('Error checking Google Calendar availability:', error.message);
    return false;
  }
};

// --- NEW FUNCTION ---
/**
 * Creates a new event in Google Calendar.
 * @param {string} startTime - The start time for the event in ISO 8601 format.
 * @param {string} endTime - The end time for the event in ISO 8601 format.
 * @param {string} summary - The title or summary of the event.
 * @param {string} [description] - Optional description for the event.
 * @returns {Promise<object|null>} - The created event object or null if it fails.
 */
export const createCalendarEvent = async (startTime, endTime, summary, description = '') => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      throw new Error('Google Calendar ID is not configured in .env file.');
    }

    const event = {
      summary: summary,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: 'UTC', // Or your desired timezone
      },
      end: {
        dateTime: endTime,
        timeZone: 'UTC', // Or your desired timezone
      },
    };

    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });

    console.log('✅ Google Calendar event created:', response.data.htmlLink);
    return response.data;
  } catch (error) {
    // Log the error but don't stop the main user creation flow
    console.error('💥 Error creating Google Calendar event:', error.message);
    return null; // Return null to indicate failure
  }
};