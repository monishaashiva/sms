import express from 'express';
import {
  getAttendanceSummary,
  getStudentEnrollment,
  getClassStrength,
  getTeacherWorkload
} from '../controllers/reportController.js';

const router = express.Router();

// debug test route
router.get('/test', (req, res) => {
  res.json({ message: 'Report routes working ✅' });
});

router.get('/attendance-summary', getAttendanceSummary);
router.get('/student-enrollment', getStudentEnrollment);
router.get('/class-strength', getClassStrength);
router.get('/teacher-workload', getTeacherWorkload);

export default router;
