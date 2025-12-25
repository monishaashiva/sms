import pool from "../config/db.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1️⃣ Get assigned class (TEXT)
    const teacherRes = await pool.query(
      "SELECT class FROM teachers WHERE id = $1",
      [teacherId]
    );

    if (!teacherRes.rows.length) {
      return res.json({
        assignedClasses: 0,
        totalStudents: 0,
        averageAttendance: 0,
        pendingAssignments: 0,
      });
    }

    const assignedClass = teacherRes.rows[0].class;
    // Example: "Class 1 A"

    const parts = assignedClass.split(" ");
    const className = `${parts[0]} ${parts[1]}`; // Class 1
    const section = parts[2];                    // A

    // 2️⃣ Get class_id
    const classRes = await pool.query(
      "SELECT id FROM classes WHERE class_name = $1 AND section = $2",
      [className, section]
    );

    if (!classRes.rows.length) {
      return res.json({
        assignedClasses: 1,
        totalStudents: 0,
        averageAttendance: 0,
        pendingAssignments: 0,
      });
    }

    const classId = classRes.rows[0].id;

    // 3️⃣ Total students
    const studentsRes = await pool.query(
      "SELECT COUNT(*) FROM students WHERE class_id = $1",
      [classId]
    );

    // 4️⃣ Attendance %
    const attendanceRes = await pool.query(
      `
      SELECT 
        COALESCE(
          COUNT(*) FILTER (WHERE status = 'present') * 100.0 / NULLIF(COUNT(*), 0),
          0
        ) AS percentage
      FROM attendance
      WHERE student_id IN (
        SELECT id FROM students WHERE class_id = $1
      )
      `,
      [classId]
    );

    res.json({
      assignedClasses: 1,
      totalStudents: Number(studentsRes.rows[0].count),
      averageAttendance: Math.round(attendanceRes.rows[0].percentage),
      pendingAssignments: 0
    });

  } catch (err) {
    console.error("TEACHER DASHBOARD ERROR 👉", err);
    res.status(500).json({ message: "Teacher dashboard error" });
  }
};
