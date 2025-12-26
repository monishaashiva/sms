import pool from "../config/db.js";

/* ===============================
   GET FEE STRUCTURE
================================ */
export const getFeeStructure = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        class_name,
        tuition_fee,
        lab_fee,
        sports_fee,
        (tuition_fee + lab_fee + sports_fee) AS total_fee,
        created_at
      FROM fee_structure
      ORDER BY id ASC
    `);

    res.json(result.rows); 
  } catch (error) {
    console.error("Fee fetch error:", error);
    res.status(500).json({ error: error.message });
  }
};


/* ===============================
   ADD FEE CATEGORY
   =============================== */
export const addFeeStructure = async (req, res) => {
  console.log("REQ BODY 👉", req.body); // 🔥 ADD THIS

  const { class_name, tuition_fee, lab_fee, sports_fee } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO fee_structure
      (class_name, tuition_fee, lab_fee, sports_fee)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [class_name, tuition_fee, lab_fee, sports_fee]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ADD FEE ERROR 👉", error);
    res.status(500).json({ error: error.message });
  }
};



/* ===============================
   UPDATE FEE CATEGORY
   =============================== */
export const updateFeeStructure = async (req, res) => {
    const { id } = req.params;
    const { tuition_fee, lab_fee, sports_fee } = req.body;

    try {
        const result = await pool.query(
            `
      UPDATE fee_structure
      SET tuition_fee = $1,
          lab_fee = $2,
          sports_fee = $3
      WHERE id = $4
      RETURNING *
      `,
            [tuition_fee, lab_fee, sports_fee, id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Fee category not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ===============================
   DELETE FEE CATEGORY
   =============================== */
export const deleteFeeStructure = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM fee_structure WHERE id = $1 RETURNING *",
            [id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Fee category not found" });
        }

        res.json({ message: "Fee category deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ===============================
   GET STUDENT FEE RECORDS
   =============================== */
export const getFeeRecords = async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT
        fr.id,
        s.name AS student_name,
        fr.class_name,
        fr.total_fee,
        fr.paid_amount,
        fr.due_amount,
        fr.status,
        fr.due_date
      FROM fee_records fr
      JOIN students s ON s.id = fr.student_id
      ORDER BY s.name
    `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* ===============================
   RECORD PAYMENT
   =============================== */
export const recordPayment = async (req, res) => {
    const { student_id, amount } = req.body;

    if (!student_id || !amount) {
        return res.status(400).json({ error: "Student ID and amount are required" });
    }

    try {
        const result = await pool.query(
            `
      UPDATE fee_records
      SET paid_amount = paid_amount + $1,
          status = CASE
            WHEN paid_amount + $1 >= total_fee THEN 'paid'
            ELSE 'pending'
          END
      WHERE student_id = $2
      RETURNING *
      `,
            [amount, student_id]
        );

        if (!result.rows.length) {
            return res.status(404).json({ error: "Fee record not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
