import mongoose, { Document, Schema } from "mongoose";

const SaveTimeTableSchema: Schema = new Schema({
    timetable: {
        type: Map,
        of: String,
        required: true
    }
});

export interface ISaveTimeTable extends Document {
    timetable: { [key: number]: string };
}

export default mongoose.model<ISaveTimeTable>("Timetable", SaveTimeTableSchema);
