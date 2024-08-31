import express from 'express';
import passport from 'passport';

const router = express.Router();

router.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/create-event');
  }
);

export default router;
