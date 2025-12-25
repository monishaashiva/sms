export const getParentDashboard = async (req, res) => {
  const { parentId } = req.params;

  try {
    // children
    const childrenRes = await pool.query(`
      SELECT s.id, s.name, s.class_name
      FROM students s
      JOIN parent_students ps ON ps.student_id = s.id
      WHERE ps.parent_id = $1
    `, [parentId]);

    // attendance %
    const attendanceRes = await pool.query(`
      SELECT 
        ROUND(
          (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::decimal /
           COUNT(*)) * 100
        ) AS attendance
      FROM attendance
      WHERE student_id = $1
    `, [childrenRes.rows[0]?.id]);

    // grades
    const gradesRes = await pool.query(`
      SELECT subject, marks, grade
      FROM grades
      WHERE student_id = $1
      ORDER BY created_at DESC
      LIMIT 3
    `, [childrenRes.rows[0]?.id]);

    // fee
    const feeRes = await pool.query(`
      SELECT status FROM fees WHERE student_id = $1
    `, [childrenRes.rows[0]?.id]);

    // notifications
    const notificationRes = await pool.query(`
      SELECT COUNT(*) FROM notifications
      WHERE parent_id = $1 AND is_read = false
    `, [parentId]);

    // events
    const eventsRes = await pool.query(`
      SELECT title AS event, event_date AS date
      FROM events
      ORDER BY event_date ASC
      LIMIT 2
    `);

    res.json({
      children: childrenRes.rows,
      stats: {
        attendance: attendanceRes.rows[0]?.attendance || 0,
        overallGrade: "A",
        feeStatus: feeRes.rows[0]?.status || "Pending",
        notifications: Number(notificationRes.rows[0].count)
      },
      recentGrades: gradesRes.rows.map(g => ({
        subject: g.subject,
        marks: `${g.marks}/100`,
        grade: g.grade
      })),
      events: eventsRes.rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard load failed" });
  }
};
