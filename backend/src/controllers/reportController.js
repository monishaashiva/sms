import pool from '../db.js';

export const getAttendanceSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.roll_number,
        ROUND(
          (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0)
          / COUNT(a.id),
          2
        ) AS attendance_percentage,
        CASE
          WHEN (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0) / COUNT(a.id) >= 75 THEN 'GOOD'
          WHEN (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) * 100.0) / COUNT(a.id) >= 50 THEN 'AVERAGE'
          ELSE 'LOW'
        END AS attendance_status
      FROM students s
      JOIN attendance a ON a.student_id = s.id
      GROUP BY s.roll_number
      ORDER BY s.roll_number;
    `);

    res.json({ report: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
