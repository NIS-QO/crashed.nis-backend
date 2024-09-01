import mongoose, { Document, Schema } from "mongoose";
import { Subject } from "../types/types";

const ClassUrlSchema: Schema = new Schema({
    class: { type: String, required: true },
    url: {type: String, required: true} 
});

export interface IClassUrl extends Document {
    class: string;
    url: string;
}


export default mongoose.model<IClassUrl>("ClassUrlDb", ClassUrlSchema);