import { google } from 'googleapis';

const calendar = google.calendar('v3');

async function createEvent(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  try {
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: 'primary', 
      requestBody: {
        summary: 'Sample Event',
        description: 'This is a sample event created by our application.',
        start: {
          dateTime: '2024-09-01T10:00:00-07:00', 
        },
        end: {
          dateTime: '2024-09-01T10:30:00-07:00', 
        },
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
