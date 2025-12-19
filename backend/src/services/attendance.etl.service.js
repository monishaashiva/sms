import fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/db.js';

export const importAttendance = async () => {
  const rows = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('src/uploads/attendance.csv')
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', async () => {
        try {
          for (const r of rows) {
            const stu = await pool.query(
              `SELECT id FROM students WHERE roll_number = $1`,
              [r.roll_number]
            );

            if (stu.rows.length === 0) continue;

            await pool.query(
              `INSERT INTO attendance (student_id, subject_id, attendance_date, status)
               VALUES ($1, $2, $3, $4)`,
              [stu.rows[0].id, r.subject_id, r.attendance_date, r.status]
            );
          }
          resolve('Attendance imported successfully');
        } catch (e) {
          reject(e);
        }
      });
  });
};
