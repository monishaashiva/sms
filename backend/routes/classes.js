import express from 'express';
import {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  addSubject,
  removeSubject,
} from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getClasses)
  .post(authorize('admin'), createClass);

router
  .route('/:id')
  .get(getClass)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

router.get('/:id/students', getClassStudents);
router.post('/:id/subjects', authorize('admin'), addSubject);
router.delete('/:id/subjects/:subjectId', authorize('admin'), removeSubject);

export default router;
