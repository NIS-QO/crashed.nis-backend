import { end } from "cheerio/dist/commonjs/api/traversing";
import Subjects from "../../scrapper/subject-models/Subject";
import { Subject } from "../../scrapper/types/types";

class ScheduleService {
    async getClassesLessons(Class: string, day_of_week: number, parallel: number, choosen: string[]): Promise<Subject[]> {
        let result: Subject[] = []
        try {
            result = await Subjects.find({
                parallel: parallel,
                day_of_week: day_of_week,
                $or: [
                    { is_choosen: false,class: Class },
                    { $and: [{ name: { $in: choosen } }, { is_choosen: true }] }
                ]
            });
        } catch (error) {
            console.error("Error fetching class lessons:", error);
        }
        const sortedResult = this.sortSubjectsByStartTime(result)
        const finalResult = this.transformSeniors(sortedResult)
        return finalResult
    }

    async getCabinesLessons(cabinet: string, day_of_week: number): Promise<Subject[]>{
        let result: Subject[] = []
        try{
            result = await Subjects.find({cabinet: cabinet, day_of_week: day_of_week})
        }catch(err){
            console.error(err)
        }
        return result 
    }

    async getTeachersLessongs(teacher: string, day_of_week: number): Promise<Subject[]>{
        let result: Subject[] = []
        try{
            result = await Subjects.find({teacher, day_of_week})
        }catch(err){
            console.error(err)
        }
        return result
    }

    timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }
    
    sortSubjectsByStartTime(subjects: Subject[]): Subject[] {
        return subjects.sort((a, b) => {
            const timeA = this.timeToMinutes(a.start_time);
            const timeB = this.timeToMinutes(b.start_time);
            return timeA - timeB;
        });
    }

    transformSeniors(subjects: Subject[]): Subject[] {
        const result: Subject[] = [];
        
        for (let i = 0; i<subjects.length;i++) {
            for (let j = 0; j < subjects[i].count; j++) {
                const newSubject = { ...subjects[i] };
                result.push((newSubject as any)._doc);
            }
        }

        for (let i = 0; i< result.length; i++){
            const [start_time, end_time] = this.times[i].split("-")
            result[i].start_time = start_time
            result[i].end_time = end_time
        }
        
        return result;
    }
    
    getStartTimesIndex(start_time: string):number{
        for(let i = 0;i<this.times.length;i++){
            if (this.times[i].startsWith(start_time)){
                return i 
            }
        }
        return 0
    }
    private times = ["08.20-09.00","09.15-09.55","10.05-10.45","10.50-11.30","11.55-12.35","13.00-13.40",
        "13.45-14.25","14.40-15.20","15.50-16.30","16.35-17.15"
    ]
}



export default ScheduleService;
