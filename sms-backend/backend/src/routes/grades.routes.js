import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * GET students + marks
 */
router.get("/", async (req, res) => {
  try {
    let { class_id, subject, exam_type } = req.query;

    if (!subject || !exam_type) {
      return res.status(400).json({ error: "subject and exam_type are required" });
    }

    // Base query
    let query = `
      SELECT
        s.id,
        s.roll_number AS roll_no,
        s.name,
        COALESCE(m.marks, '') AS marks
      FROM students s
      LEFT JOIN marks m
        ON m.student_id = s.id
        AND m.subject = $1
        AND m.exam_type = $2
    `;
    
    const values = [subject, exam_type];

    // Only add class filter if class_id is a valid number
    if (class_id && class_id.trim() !== "" && !isNaN(Number(class_id))) {
      query += ` WHERE s.class_id = $3`;
      values.push(Number(class_id));
    }

    query += ` ORDER BY s.roll_number`;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error("POSTGRES ERROR 👉", err);
    res.status(500).json({ error: err.message });
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
      if (!item.student_id || item.student_id.toString().trim() === "") continue;

      const student_id = Number(item.student_id);
      const mark = item.marks === "" ? null : Number(item.marks);

      // skip invalid numeric conversion
      if (isNaN(student_id) || (mark !== null && isNaN(mark))) continue;

      await pool.query(
        `
        INSERT INTO marks (student_id, subject, marks, exam_type)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (student_id, subject, exam_type)
        DO UPDATE SET marks = EXCLUDED.marks
        `,
        [student_id, subject, mark, exam_type]
      );
    }

    res.json({ message: "Marks saved successfully" });

  } catch (error) {
    console.error("Save marks error ", error);
    res.status(500).json({ error: "Failed to save marks" });
  }
});

export default router;
