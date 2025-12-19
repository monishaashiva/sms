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
            // 1. Insert into users
            const userRes = await pool.query(
              `INSERT INTO users (full_name, email, password_hash, role)
               VALUES ($1, $2, $3, 'STUDENT')
               RETURNING id`,
              [student.full_name, student.email, 'csv_imported']
            );

            const userId = userRes.rows[0].id;

            // 2. Insert into students
            await pool.query(
              `INSERT INTO students 
               (user_id, roll_number, class, section, date_of_birth, admission_date)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                userId,
                student.roll_number,
                student.class,
                student.section,
                student.date_of_birth,
                student.admission_date,
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
