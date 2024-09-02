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

export interface ISubject extends Document{
    class: string;
    name: string;
    teacher: string;
    cabinet: string;
    start_time: string;
    end_time: string;
    count: number;
    index: number
    is_choosen: boolean;
    internal_index: number,
    parallel: number,
    day_of_week: number,
}

export default mongoose.model<ISubject>("Subjects", SubjectSchema);