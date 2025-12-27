import express from 'express';
import {
  getAdminDashboard,
  getTeacherDashboard,
  getParentDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/teacher', authorize('teacher'), getTeacherDashboard);
router.get('/parent', authorize('parent'), getParentDashboard);

export default router;
