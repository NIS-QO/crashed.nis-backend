import { Router } from "express";
import ScheduleService from "./schedule-service";
import { ScheduleController } from "./schedule-controller";

const scheduleRouter = Router()

const scheduleService = new ScheduleService()
const scheduleController = new ScheduleController(scheduleService)


scheduleRouter.get("/class", scheduleController.getSchedule)

export default scheduleRouter