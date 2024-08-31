import express from 'express';
import calendarService from '../../services/calendarService';

const router = express.Router();

router.get('/create-event', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }

  const user = req.user as { profile: any; accessToken: string };

  try {
    const event = await calendarService.createEvent(user.accessToken);
    res.json({ message: 'Event created', event });
  } catch (error) {
    console.error(error)
    res.status(500).send('Error creating event');
  }
});

export default router;
