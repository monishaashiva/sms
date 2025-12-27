import express from 'express';
import {
  getNotifications,
  getNotification,
  createNotification,
  updateNotification,
  deleteNotification,
  getRecentNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getNotifications)
  .post(authorize('admin'), createNotification);

router.get('/recent', getRecentNotifications);
router.get('/unread/count', getUnreadCount);
router.put('/read/all', markAllAsRead);

router
  .route('/:id')
  .get(getNotification)
  .put(authorize('admin'), updateNotification)
  .delete(authorize('admin'), deleteNotification);

router.put('/:id/read', markAsRead);

export default router;
