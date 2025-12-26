import pool from "../config/db.js";

/* ===============================
   GET ALL TEACHERS
================================ */
export const getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM teachers");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   GET TEACHER BY ID
================================ */
export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM teachers WHERE id = $1",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   CREATE TEACHER
================================ */
export const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, subject, class_name } = req.body;

    const result = await pool.query(
      `INSERT INTO teachers (name, email, phone, subject, class_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, subject, class_name]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TEACHER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


/* ===============================
   UPDATE TEACHER
================================ */
export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subject, class_name } = req.body;

    const result = await pool.query(
      `UPDATE teachers
       SET name=$1, email=$2, phone=$3, subject=$4, class_name=$5
       WHERE id=$6
       RETURNING *`,
      [name, email, phone, subject, class_name, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===============================
   DELETE TEACHER
================================ */
export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM teachers WHERE id = $1", [id]);
    res.json({ message: "Teacher deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
