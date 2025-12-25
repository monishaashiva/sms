import express from "express";
import pool from "../config/db.js";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.get("/", getAllTeachers);
router.get("/:id", getTeacherById);  
router.post("/", createTeacher);
router.put("/:id", updateTeacher);
router.delete("/:id", deleteTeacher);

export default router;
