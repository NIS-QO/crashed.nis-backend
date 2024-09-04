import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import NodeCache from 'node-cache';
import calendarService from '../../services/calendarService';
import { Subject } from '../../scrapper/types/types';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 300 }); 

router.get('/create-event', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const user = req.user as { profile: any; accessToken: string };

  try {
    const uniqueId = uuidv4(); 

    cache.set(uniqueId, { accessToken: user.accessToken });

    res.redirect(`https://google.com?event_id=${uniqueId}`)
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating event');
  }
});

router.post('/save-event', async (req, res) => {
  const id = req.headers['x-event-id'] as string 
  if (!id) {
    return res.status(400).send('Event ID is required');
  }

  const cachedData = cache.get<{ accessToken: string }>(id);

  if (!cachedData) {
    return res.status(404).send('Google session is exprired, try again');
  }

  const events: Subject[] = req.body;

  if (!events || events.length === 0) {
    return res.status(404).send('Event not found or expired');
  }

  try {
    for (const event of events) {
      await calendarService.createEvent(cachedData.accessToken, event); 
    }
      res.json({ message: 'Event saved successfully'});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving event');
    }
});

export default router;
