import express from 'express';
import {
  getGrades,
  getGrade,
  addGrade,
  addBulkGrades,
  updateGrade,
  deleteGrade,
  getStudentGrades,
  getClassGrades,
  getGradeReport,
} from '../controllers/gradeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getGrades)
  .post(authorize('admin', 'teacher'), addGrade);

router.post('/bulk', authorize('admin', 'teacher'), addBulkGrades);

router
  .route('/:id')
  .get(getGrade)
  .put(authorize('admin', 'teacher'), updateGrade)
  .delete(authorize('admin'), deleteGrade);

router.get('/student/:studentId', getStudentGrades);
router.get('/class/:classId', getClassGrades);
router.get('/report/:studentId', getGradeReport);

export default router;
