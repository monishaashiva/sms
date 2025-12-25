import pool from "../config/db.js";

/* ===============================
   GET ALL STUDENTS
================================ */
export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.name,
        s.roll_number,
        s.class_id,
        c.class_name,
        c.section
      FROM students s
      JOIN classes c ON c.id = s.class_id
      ORDER BY s.id
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   GET STUDENT BY ID  
================================ */
export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        s.*,
        c.class_name,
        c.section
      FROM students s
      JOIN classes c ON c.id = s.class_id
      WHERE s.id = $1
    `, [id]);

    if (!result.rows.length) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   CREATE STUDENT
================================ */
export const createStudent = async (req, res) => {
  const { name, roll_number, classId } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO students (name, roll_number, class_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, roll_number, classId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   UPDATE STUDENT  
================================ */
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, roll_number, classId } = req.body;

  try {
    const result = await pool.query(
      `UPDATE students
       SET name=$1, roll_number=$2, class_id=$3
       WHERE id=$4
       RETURNING *`,
      [name, roll_number, classId, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ===============================
   DELETE STUDENT
================================ */
export const deleteStudent = async (req, res) => {
  try {
    await pool.query("DELETE FROM students WHERE id=$1", [req.params.id]);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
