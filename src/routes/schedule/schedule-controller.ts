import {Request, Response} from "express"
import ScheduleService from "./schedule-service"

export class ScheduleController{
    private scheduleService: ScheduleService
    constructor(scheduleService: ScheduleService){
        this.scheduleService = scheduleService
    }
    getSchedule = async(req: Request, res: Response) => {
        try{
            const {klass, day, choosen} = req.body 
            const parallelString = klass.slice(0, -1);
            const parallelInt = parseInt(parallelString, 10);
            console.log(klass,day, parallelInt, choosen)
            const result = await this.scheduleService.getClassesLessons(klass, day,parallelInt,choosen)
            res.status(200).send(result)
        }catch(err){
            console.error(err)
            res.status(400).send(err)
        }
    }
}