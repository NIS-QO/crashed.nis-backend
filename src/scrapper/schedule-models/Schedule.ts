import mongoose, { Document, Schema } from "mongoose";
import { Subject } from "../types/types";

const SubjectSchema: Schema = new Schema({
    name: { type: String, required: true },
    teacher: { type: String, required: true },
    cabinet: { type: String, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true }
});

const ScheduleSchema: Schema = new Schema({
    class: { type: String, required: true },
    schedule: [[SubjectSchema]] 
});

export interface ISchedule extends Document {
    class: string;
    schedule: Subject[][];
}

export interface ITimetable extends Document{
    
}

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);