import {Request, Response} from "express"
import ScheduleService from "./schedule-service"
import { trusted } from "mongoose"

export class ScheduleController{
    private scheduleService: ScheduleService
    constructor(scheduleService: ScheduleService){
        this.scheduleService = scheduleService
    }
    getSchedule = async(req: Request, res: Response) => {
        try{
            let {klass, day, choosen} = req.body 
            const {today} = req.query
            if (today){
                day = this.scheduleService.getDayOfWeekGMT5()
            }
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

    getTodaySchedule = async(req: Request, res: Response) => {
        try{
            const {klass, choosen} = req.body 
            const parallelString = klass.slice(0,-1)
            const parallelInt = parseInt(parallelString, 10)
            const day = this.scheduleService.getDayOfWeekGMT5()
            const result = await this.scheduleService.getClassesLessons(klass,day,parallelInt,choosen)
            res.status(200).send(result)
        }catch(err){
            console.error(err)
            res.status(400).send(err)
        }
    }

    getTeachersSchedule = async(req: Request, res: Response) => {
        try{
            let {teacher, day} = req.body
            const {today} = req.query
            if (today){
                day = this.scheduleService.getDayOfWeekGMT5()
            }
            const result = await this.scheduleService.getTeachersLessongs(teacher, day)
            res.status(200).send(result)
        }catch(err){
            console.error(err)
            res.status(400).send(err)
        }
    }

    getCabinet = async(req: Request, res: Response) => {
        try{
            let { cabinet, dayStr } = req.query;
            let day: number = parseInt(dayStr as string, 10);

            if (isNaN(day)) {
                day = this.scheduleService.getDayOfWeekGMT5();
            }

            const result = await this.scheduleService.getCabinesLessons(cabinet as string, day)
            res.status(200).send(result)
        }catch(err){
            console.error(err)
            res.status(400).send(err)
        }
    }
}