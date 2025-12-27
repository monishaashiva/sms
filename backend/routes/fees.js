import express from 'express';
import {
  getFees,
  getFee,
  createFee,
  createClassFees,
  updateFee,
  deleteFee,
  recordPayment,
  getStudentFees,
  getPendingFees,
  getOverdueFees,
  applyDiscount,
  getFeeReport,
} from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router
  .route('/')
  .get(getFees)
  .post(authorize('admin'), createFee);

router.post('/class/:classId', authorize('admin'), createClassFees);
router.get('/pending', authorize('admin'), getPendingFees);
router.get('/overdue', authorize('admin'), getOverdueFees);
router.get('/report', authorize('admin'), getFeeReport);

router
  .route('/:id')
  .get(getFee)
  .put(authorize('admin'), updateFee)
  .delete(authorize('admin'), deleteFee);

router.post('/:id/payment', authorize('admin'), recordPayment);
router.post('/:id/discount', authorize('admin'), applyDiscount);
router.get('/student/:studentId', getStudentFees);

export default router;
