import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/dashboard/:teacherId", async (req, res) => {
  res.json({ message: "Teacher dashboard route working" });
});

export default router;
