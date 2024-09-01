import mongoose, { Document, Schema } from "mongoose";
import { Subject } from "../types/types";

const SubjectSchema: Schema = new Schema({
    name: { type: String },
    teacher: { type: String },
    cabinet: { type: String },
    start_time: { type: String },
    end_time: { type: String },
    count: {type: Number},
    index: {type: Number},
    is_choosen: {type: Boolean}
});

const ScheduleSchema: Schema = new Schema({
    class: { type: String, required: true },
    schedule: [[[SubjectSchema]]] 
});

export interface ISchedule extends Document {
    class: string;
    schedule: Subject[][];
}

export interface ITimetable extends Document{
    
}

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);