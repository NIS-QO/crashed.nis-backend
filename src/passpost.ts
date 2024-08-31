import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.REDIRECT_URI!,
    scope: ['https://www.googleapis.com/auth/calendar'],
  },
  (accessToken: string, refreshToken: string, profile: any, done: Function) => {
    return done(null, { profile, accessToken });
  }
));

passport.serializeUser((user: any, done: Function) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done: Function) => {
  done(null, obj);
});
