import express from "express"; 
import pool from "../config/db.js";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

const router = express.Router();

router.get("/", getAllStudents);
router.get("/:id", getStudentById);     
router.post("/", createStudent);
router.put("/:id", updateStudent);      
router.delete("/:id", deleteStudent);

export default router;