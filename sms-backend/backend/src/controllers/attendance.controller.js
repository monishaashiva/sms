import pool from "../config/db.js";

// GET attendance by class + date
export const getAttendanceByClassAndDate = async (req, res) => {

  const { classId, date } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT 
        s.id,
        s.name,
        s.roll_number,
        COALESCE(a.status, 'not_marked') AS status
      FROM students s
      LEFT JOIN attendance a
        ON a.student_id = s.id
       AND a.attendance_date = $1
      WHERE s.class_id = $2
      ORDER BY s.roll_number
      `,
      [date, classId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FETCH ATTENDANCE ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// SAVE attendance
export const saveAttendance = async (req, res) => {
  console.log(" saveAttendance HIT");
  console.log(" BODY:", req.body);

  const { date, records } = req.body;


  if (!date || !records?.length) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  try {
    for (const r of records) {
      await pool.query(
        `
        INSERT INTO attendance (student_id, attendance_date, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (student_id, attendance_date)
        DO UPDATE SET status = EXCLUDED.status
        `,
        [r.student_id, date, r.status]
      );
    }

    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.error("SAVE ATTENDANCE ERROR:", err.message);
    res.status(500).json({ message: "Failed to save attendance" });
  }
};