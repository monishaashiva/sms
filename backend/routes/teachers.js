import express from 'express';
import {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherClasses,
  assignClass,
  removeClass,
  getMe,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getTeachers)
  .post(authorize('admin'), createTeacher);

router.get('/me', getMe);

router
  .route('/:id')
  .get(getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

router.get('/:id/classes', getTeacherClasses);
router.post('/:id/classes', authorize('admin'), assignClass);
router.delete('/:id/classes/:classId', authorize('admin'), removeClass);

export default router;
