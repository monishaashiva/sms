import express from "express";
import {
  getAttendanceByClassAndDate,
  saveAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.get("/", getAttendanceByClassAndDate);
router.post("/", saveAttendance);

export default router;
