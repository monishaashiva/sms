import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET dashboard summary
 */
router.get("/summary", async (req, res) => {
  try {
    const studentsCount = await pool.query(
      "SELECT COUNT(*) FROM students"
    );

    // COUNT TEACHERS 
    const teachersResult = await pool.query(
      "SELECT COUNT(*) FROM teachers"
    );

    const recentStudents = await pool.query(
      `
      SELECT id, roll_number, name, created_at
      FROM students
      ORDER BY created_at DESC
      LIMIT 5
      `
    );

    res.json({
      totalStudents: Number(studentsCount.rows[0].count),
      totalTeachers: Number(teachersResult.rows[0].count),
      recentStudents: recentStudents.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Dashboard data failed" });
  }
});

export default router;
