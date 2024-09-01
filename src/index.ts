import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './routes/auth/auth-router';
import eventRoutes from './routes/events/events-router';
import dotenv from 'dotenv';
import './passpost';
import { ScrapperController } from './scrapper/scrapper-controller';
import { ScrapperService } from './scrapper/scrapper-service';
import connectDB from './db';

dotenv.config();

const app = express();

app.use(express.static('src/views'));
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/', eventRoutes);

const some = async() => {
  await connectDB()
  const service = new ScrapperService()
  const controler = new ScrapperController(service)
  await controler.loadSchedule()
}
some()

// app.listen(3000, () => {
//   console.log('Server running on http://localhost:3000');
// });
