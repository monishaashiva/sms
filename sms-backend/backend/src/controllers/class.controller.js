import pool from "../config/db.js";

export const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, class_name
      FROM classes
      ORDER BY class_name
    `);
    res.json({ data: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createClass = async (req, res) => {
  const { class_name } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO classes (class_name) VALUES ($1) RETURNING *",
      [class_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
