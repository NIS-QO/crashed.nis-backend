import { Subject } from "../types/types";

export interface SaveScheduleDto{
    schedule: Subject[][]
}

export interface SaveTimeTable{
    timetable: { [key: number]: string }
}