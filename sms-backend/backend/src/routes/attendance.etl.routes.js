import express from 'express';
import { importAttendance } from '../services/attendance.etl.service.js';

const router = express.Router();

router.get('/import/attendance', async (req, res) => {
  try {
    const msg = await importAttendance();
    res.json({ message: msg });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
