import express from 'express';
import {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getAttendance)
  .post(authorize('admin', 'teacher'), markAttendance);

router
  .route('/:id')
  .put(authorize('admin', 'teacher'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

router.get('/student/:studentId', getStudentAttendance);
router.get('/class/:classId', getClassAttendance);
router.get('/report', authorize('admin', 'teacher'), getAttendanceReport);

export default router;
