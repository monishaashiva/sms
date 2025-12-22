import fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/db.js';

export const importStudents = async () => {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('src/uploads/students.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (const student of results) {

            // 1. Check or insert user
            let userRes = await pool.query(
              `SELECT id FROM users WHERE email = $1`,
              [student.email]
            );

            let userId;

            if (userRes.rows.length > 0) {
              userId = userRes.rows[0].id;
            } else {
              const insertUser = await pool.query(
                `INSERT INTO users (name, email, role)
                 VALUES ($1, $2, 'STUDENT')
                 RETURNING id`,
                [student.name, student.email]
              );
              userId = insertUser.rows[0].id;
            }

            // 2. Insert student (avoid duplicates)
            await pool.query(
              `INSERT INTO students (roll_number, name, class_id)
               VALUES ($1, $2, $3)
               ON CONFLICT (roll_number) DO NOTHING`,
              [
                student.roll_number,
                student.name,
                student.class_id
              ]
            );
          }

          resolve('Students imported successfully');
        } catch (err) {
          reject(err);
        }
      });
  });
};
