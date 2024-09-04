import { google } from 'googleapis';
import { addDays, formatISO, getDay, nextDay, setHours, setMinutes } from 'date-fns';
import { Subject } from '../scrapper/types/types';

const calendar = google.calendar('v3');

async function createEvent(accessToken: string, event: Subject) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  event.day_of_week--

  const now = new Date();
  const currentDayOfWeek = getDay(now); 
  
  let eventDate: Date;
  if (currentDayOfWeek === event.day_of_week) {
    eventDate = now;
  } else {
    eventDate = nextDay(now, event.day_of_week as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  }
  const [start_hour, start_min] = event.start_time.split(":").map(Number); 
  const [end_hour, end_min] = event.end_time.split(":").map(Number);

  const eventStart = formatISO(setMinutes(setHours(eventDate, start_hour), start_min), { format: 'extended' });
  const eventEnd = formatISO(setMinutes(setHours(eventDate, end_hour), end_min), { format: 'extended' });


  try {
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary',
      requestBody: {
        summary: event.name,
        description: `${event.name} with ${event.teacher} in ${event.cabinet}`,
        start: {
          dateTime: `${eventDate.toISOString().split('T')[0]}T${start_hour.toString().padStart(2, '0')}:${start_min.toString().padStart(2, '0')}:00+05:00`, 
          timeZone: 'GMT+5',
        },
        end: {
          dateTime: `${eventDate.toISOString().split('T')[0]}T${end_hour.toString().padStart(2, '0')}:${end_min.toString().padStart(2, '0')}:00+05:00`, 
          timeZone: 'GMT+5',
        },
        recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=' + ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][event.day_of_week]],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export default {
  createEvent,
};
