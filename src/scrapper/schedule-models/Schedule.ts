import mongoose, { Document, Schema } from "mongoose";
import { Subject } from "../types/types";

const SubjectSchema: Schema = new Schema({
    class: {type: String},
    name: { type: String },
    teacher: { type: String },
    cabinet: { type: String },
    start_time: { type: String },
    end_time: { type: String },
    count: {type: Number},
    index: {type: Number},
    is_choosen: {type: Boolean},
    internal_index: {type: Number},
    parallel: {type: Number},
    day_of_week: {type: Number}
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