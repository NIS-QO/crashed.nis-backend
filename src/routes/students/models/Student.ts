import mongoose, { Document, Schema } from "mongoose";

const StudentSchema: Schema = new Schema({
    class: { type: String},
    name: {type: String},
    group: {type: String} ,
    subject: {type: String}
});

export interface IStudent extends Document {
    class: string;
    name: string;
    group: string;
    subject: string;
}


export default mongoose.model<IStudent>("Students", StudentSchema);