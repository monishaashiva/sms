import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/dashboard/:parentId", async (req, res) => {
  res.json({
    children: [
      {
        id: 1,
        name: "Aarav Sharma",
        class_name: "10-A",
        stats: {
          attendance: 92,
          overallGrade: "A",
          feeStatus: "Paid",
          notifications: 3
        },
        recentGrades: [
          { subject: "Mathematics", marks: "92/100", grade: "A+" },
          { subject: "English", marks: "88/100", grade: "A" },
          { subject: "Science", marks: "95/100", grade: "A+" }
        ],
        events: [
          { event: "Parent-Teacher Meeting", date: "Jan 20, 2024" }
        ]
      },
      {
        id: 2,
        name: "Vihaan Sharma",
        class_name: "7-A",
        stats: {
          attendance: 85,
          overallGrade: "B+",
          feeStatus: "Pending",
          notifications: 1
        },
        recentGrades: [
          { subject: "Mathematics", marks: "78/100", grade: "B+" },
          { subject: "English", marks: "82/100", grade: "A" }
        ],
        events: [
          { event: "Science Fair", date: "Feb 5, 2024" }
        ]
      }
    ]
  });
});

export default router;
