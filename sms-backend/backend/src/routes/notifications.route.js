import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/**
 * CREATE NOTIFICATION (ADMIN)
 */
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await pool.query(
      `
      INSERT INTO notifications (parent_id, message, is_read)
      VALUES (NULL, $1, false)
      RETURNING *
      `,
      [message]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create notification error 👉", err);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

/**
 * GET ALL NOTIFICATIONS (ADMIN HISTORY)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch notifications error 👉", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * DELETE NOTIFICATION (ADMIN)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM notifications WHERE id = $1 RETURNING *",
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Delete notification error 👉", err);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});


export default router;
