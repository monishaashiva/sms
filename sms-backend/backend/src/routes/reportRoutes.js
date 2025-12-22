import express from 'express';
import { getAttendanceSummary } from '../controllers/reportController.js';

const router = express.Router();

router.get('/attendance-summary', getAttendanceSummary);

export default router;
