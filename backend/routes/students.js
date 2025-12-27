import express from 'express';
import {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  getStudentFees,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getStudents)
  .post(authorize('admin'), createStudent);

router
  .route('/:id')
  .get(getStudent)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.get('/:id/grades', getStudentGrades);
router.get('/:id/attendance', getStudentAttendance);
router.get('/:id/fees', getStudentFees);

export default router;
