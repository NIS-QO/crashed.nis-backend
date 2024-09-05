import { Router } from "express";
import { StudentController } from "./student-controller";
import { StudentService } from "./student-service";

const studentRouter = Router()

const studentService = new StudentService();
const studentController = new StudentController(studentService);


studentRouter.get("/save", studentController.SaveStudents)
studentRouter.get("/classes", studentController.GetStudentsSubjects)
studentRouter.get("/students", studentController.GetClassesStudents)

export default studentRouter