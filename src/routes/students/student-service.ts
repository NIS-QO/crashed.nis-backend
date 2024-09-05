import { Student } from "./types/Student";
import Students from "./models/Student"

export class StudentService {
    formatStudentString(students: string, group: string, subject: string): Student[] {
      const result: Student[] = [];
      
      const studentLines = students.split('\n');
      
      studentLines.forEach((line) => {
        const parts = line.trim().split(/\s{2,}/);
        
        if (parts.length === 2) {
          const name = parts[0].trim(); 
          const studentClass = parts[1].trim(); 
          
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
            await Students.findOneAndReplace({name: data.name, subject: data.subject}, data)
        }catch(err){
            console.error(err)
        }
    }

    
  }
  