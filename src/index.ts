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
import ScheduleService from './routes/schedule/schedule-service';
import scheduleRouter from './routes/schedule/schedule-router';

dotenv.config();

const app = express();

app.use(express.static('src/views'));
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: true
}));
app.use(express.json())

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);
app.use('/', eventRoutes);
app.use("/", scheduleRouter)

const some = async() => {
  await connectDB()
  const service = new ScrapperService()
  const controler = new ScrapperController(service)
  const scheduleService = new ScheduleService()
  // const raspa = await scheduleService.getClassesLessons("11H",2,11,[])
  // // const raspa = await scheduleService.getCabinesLessons("223", 2)
  // console.log(raspa)
  // await controler.loadSchedule()
  // await service.GetScheduleViaAxios("https://docs.google.com/spreadsheets/d/1r8qzFN-ijQhbQ9Ctj0wGHC-JTKCZZxJ-/edit?gid=457180191#gid=457180191", 11)
 }
some()

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
