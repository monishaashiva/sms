# SMS 2.0 - Testing Guide

This guide details how to manually verify all the key features of the School Management System. Since there are no automated unit tests yet, we rely on "End-to-End" user scenarios.

---

## 🧪 Phase 1: Basic Health Check

Before logging in, ensure the system is stable:

1.  **Backend Check**: Open [http://localhost:5000/api/health](http://localhost:5000/api/health)
    - *Expected*: `{"status":"healthy","server":"SMS Backend"}`
2.  **Frontend Check**: Open [http://localhost:8080](http://localhost:8080)
    - *Expected*: Login Screen with "School Management System" title.

---

## 👩‍💼 Phase 2: Admin Workflows (The Manager)

**Login**: `admin@school.com` / `admin123`

### Scenario 1: Create a New Student & Parent
1. Go to **Students** > **Add Student**.
2. **Action**: Fill in details:
   - Name: "Rahul Verma"
   - Class: "10-A"
   - Parent Email: "rahul.parent@test.com"
3. **Verify**:
    - You see "Student Created Successfully" toast.
    - Go to **Student List** -> Search "Rahul" -> He appears.
    - *Behind the Scenes*: A Parent User (`rahul.parent@test.com`) is auto-created.

### Scenario 2: Create a Notification
1. Go to **Notifications** > **Create New**.
2. **Action**:
   - Title: "Sports Day"
   - Message: "Sports day on Friday!"
   - Recipients: "All"
3. **Verify**:
   - Notification appears in the list.

---

## 👩‍🏫 Phase 3: Teacher Workflows (The Operator)

**Login**: `teacher@school.com` / `teacher123`

### Scenario 1: Mark Attendance
1. Go to **Attendance**.
2. Select **Class 10-A**.
3. **Action**:
   - Mark "Aarav Sharma" as **Present**.
   - Mark "Ananya Patel" as **Absent**.
   - Click **Save Attendance**.
4. **Verify**:
   - Refresh page. The status should persist.

### Scenario 2: Enter Grades
1. Go to **Grades** tab.
2. Select **Class 10-A**, **Mathematics**, **Mid-Term**.
3. **Action**: Enter "85" for Aarav.
4. **Verify**:
   - Click Save.
   - Percentage (85%) should auto-calculate.

---

## 👨‍👩‍👧 Phase 4: Parent Workflows (The Viewer)

**Login**: `parent@school.com` / `parent123`

### Scenario 1: Dashboard Overview
1. **Verify**:
   - You see "Aarav Sharma" (your child).
   - "Attendance" card shows percentage (should match what Teacher marked).

### Scenario 2: Check Fees
1. Go to **Fees** tab.
2. **Verify**:
   - You see "Annual Fee 2024-2025".
   - Status: "Paid" or "Pending".
   - Total Amount: ₹63,000 (verified real data).

### Scenario 3: Notifications
1. Go to **Notifications** tab.
2. **Verify**:
   - You see the "Sports Day" notification created by Admin in Phase 2.

---

## 🐞 Troubleshooting Common Issues

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **"Login Failed"** | Incorrect password or DB not seeded | Run `npm run seed` in backend. |
| **"0 Attendance"** | No records for today | Login as Teacher and mark attendance for *today*. |
| **White Screen** | Frontend crash | Check browser console (F12) for errors. |
| **API Error** | Backend not running | Check terminal on port 5000. |
