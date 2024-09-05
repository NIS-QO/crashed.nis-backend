import { Request, Response } from "express"
import { StudentService } from "./student-service"
import { TargetType } from "puppeteer"
import { Student } from "./types/Student";
import Students from "./models/Student"
import { Subject } from "../../scrapper/types/types";

export class StudentController{
    private studentService: StudentService;

    constructor(studentService: StudentService) {  
        this.studentService = studentService;
    }

    SaveStudents = async (req: Request, res: Response) => {
        const { studentString, subject, group } = req.body;
        try {
            const students = this.formatStudentString(studentString, group, subject);
            console.log(students)
            for(let i = 0; i < students.length; i++){
                if (students[i].class === "11"){
                    students[i].class = await this.getClass(students[i].name) || ""
                 }
                 await this.saveStudent(students[i])
            }
            res.status(200).send("Successfully added all of them");
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    };

    GetStudentsSubjects = async(req: Request, res: Response) => {
        const {name, Class} = req.body 
        try{
            const classes = await this.getStudentsClasses(name, Class)
            res.status(200).send(classes)
        }catch(err){
            res.status(400).send(err)
        }
    }

    GetClassesStudents = async(req: Request, res: Response) => {
        const {className} = req.query 
        try{
            const students = await this.getUniqueStudentNamesByClass(className as string)
            res.status(200).send(students)
        }catch(err){
            res.status(400).send(err)
        }
    }
    
    formatStudentString(students: string, group: string, subject: string): Student[] {
        const result: Student[] = [];
        
        const studentLines = students.split('\n');
        
        studentLines.forEach((line) => {
            // Remove leading/trailing spaces and split by single space
            const parts = line.trim().split(/\s+/);
            
            // Ensure the line has at least 3 parts (ID, name, class)
            if (parts.length >= 3) {
              // Join all parts except the last one (class) as name
              const name = parts.slice(1, -1).join(' ').trim(); 
              const studentClass = parts[parts.length - 1].trim(); 
              
              result.push({
                name,
                class: studentClass,
                group,
                subject
              });
            }
          });
        
        return result;
      }
  
      async saveStudent(data: Student){
          try{
              await Students.findOneAndReplace({name: data.name, subject: data.subject}, data,                { upsert: true }
              )
          }catch(err){
              console.error(err)
          }
      }

      async getStudentsClasses(name: string, Class: string):Promise<Student[]>{
        try{
            const subjects = await Students.find({name: name, class: Class})
            return subjects 
        }catch(err){
            console.error(err)
            return []
        }
      }

      async getUniqueStudentNamesByClass(className: string): Promise<string[]> {
        try {
            const students = await Students.find({ class: className }).select("name").exec();
    
            const uniqueNames = [...new Set(students.map(student => student.name))];
    
            return uniqueNames;
        } catch (error) {
            console.error("Error fetching student names:", error);
            throw new Error("Failed to fetch student names.");
        }
    }

    async getClass(name: string): Promise<string | null> {
        try {
            const student = await Students.findOne({ name }).select("class").exec();
            if (student) {
                return student.class;
            }
            return null; 
        } catch (error) {
            console.error("Error fetching class:", error);
            throw new Error("Failed to fetch class.");
        }
    }

    async deleteWhereNoClass(){
        try{
            await Students.deleteMany({class: "11"})
        }catch(err){
            console.error(err)
        }
    }
}