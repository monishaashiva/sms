import express from 'express';
import { importStudents } from '../services/etl.service.js';

const router = express.Router();

router.get('/import/students', async (req, res) => {
  try {
    const message = await importStudents();
    res.json({ message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
