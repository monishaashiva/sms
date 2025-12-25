import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET students + marks
 */
router.get("/", async (req, res) => {
  try {
    const { class_id, subject, exam_type } = req.query;

    if (!subject || !exam_type) {
      return res.status(400).json({ error: "subject and exam_type are required" });
    }

    let query = `
      SELECT
        s.id,
        s.roll_number,       
        s.name,
        s.class_id,
        m.marks
      FROM students s
      LEFT JOIN marks m
        ON m.student_id = s.id
        AND m.subject = $1
        AND m.exam_type = $2
    `;

    const values = [subject, exam_type];

    if (class_id && !isNaN(class_id)) {
      query += ` WHERE s.class_id = $3`;
      values.push(Number(class_id));
    }

    query += ` ORDER BY s.roll_number`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Grades fetch error 👉", err);
    res.status(500).json({ error: "Server error" });
  }
});


/**
 * SAVE / UPDATE MARKS
 */
router.post("/", async (req, res) => {
  try {
    const { subject, exam_type, marks } = req.body;

    if (!subject || !exam_type || !Array.isArray(marks)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    for (const item of marks) {
      const studentId = Number(item.student_id);

      if (!studentId) continue;

      const markValue =
        item.marks === "" || item.marks === null
          ? null
          : Number(item.marks);

      if (markValue !== null && isNaN(markValue)) continue;

      await pool.query(
        `
        INSERT INTO marks (student_id, subject, marks, exam_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, subject, exam_type)
        DO UPDATE SET marks = EXCLUDED.marks
        `,
        [studentId, subject, markValue, exam_type]
      );
    }

    res.json({ message: "Marks saved successfully" });
  } catch (err) {
    console.error("Save marks error 👉", err);
    res.status(500).json({ error: "Failed to save marks" });
  }
});

export default router;
