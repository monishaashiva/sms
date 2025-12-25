import pool from "../config/db.js";

/* 1️⃣ Attendance Summary (already you had – keep it) */
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* 2️⃣ Student Enrollment Report */
export const getStudentEnrollment = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT roll_number, name, class_id
      FROM students
      ORDER BY roll_number;
    `);
    res.json({ report: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 3️⃣ Class Strength Report */
export const getClassStrength = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.class_name, COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      GROUP BY c.class_name
      ORDER BY c.class_name;
    `);
    res.json({ report: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* 4️⃣ Teacher Workload Report */
export const getTeacherWorkload = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.name AS teacher_name, COUNT(c.id) AS classes_assigned
      FROM teachers t
      LEFT JOIN classes c ON c.teacher_id = t.id
      GROUP BY t.name
      ORDER BY t.name;
    `);
    res.json({ report: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
