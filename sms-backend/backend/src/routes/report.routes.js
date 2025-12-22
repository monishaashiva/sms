import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET Attendance Percentage Report
 */
router.get("/attendance-percentage", async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id AS student_id,
        s.roll_number,
        COUNT(a.id) AS total_days,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS present_days,
        ROUND(
          (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0) 
          / COUNT(a.id), 
          2
        ) AS attendance_percentage
      FROM students s
      JOIN attendance a ON a.student_id = s.id
      GROUP BY s.id, s.roll_number
      ORDER BY s.roll_number;
    `;

    const result = await pool.query(query);

    res.json({
      report: result.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch attendance report" });
  }
});

export default router;
