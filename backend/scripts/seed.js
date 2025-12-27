import prisma from '../config/prisma.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    // Note: deleteMany({}) deletes all records
    await prisma.notificationRead.deleteMany();
    await prisma.feePayment.deleteMany();
    await prisma.feeDiscount.deleteMany();
    await prisma.fee.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.student.deleteMany();
    // Teacher and Class have cyclic dependency? 
    // Class has classTeacherId (Teacher). Teacher has classes? (Implicit Many-to-many or specific relation)
    // In schema: Class has classTeacherId. Teacher has classes relation.
    // We should nullify classTeacherId first or just delete Class first if Teacher depends on it?
    // Teacher model: relations to class.
    // Let's safe delete:
    // 1. Remove optional relations
    // Actually Prisma deleteMany fails if foreign keys exist.
    // Order:
    // 1. Child tables (Fee, Grade, Attendance, Notification) - done
    // 2. Students (depends on Class) - done
    // 3. Classes (depends on Teacher - optional classTeacherId)
    // 4. Teachers (depends on User)
    // 5. Users
    // 6. Notification (depends on User) - wait, Notifications created by User.
    // Notifications deleted first.
    await prisma.notification.deleteMany();

    // Classes have classTeacherId FK. Teachers have keys? Teacher table has userId.
    // If we delete teachers, classTeacherId will violate constraint if not optional/cascade.
    // We can delete classes first.
    await prisma.class.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Helper for hashing
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    };

    // Create Users
    const adminPassword = await hashPassword('admin123');
    const teacherPassword = await hashPassword('teacher123');
    const parentPassword = await hashPassword('parent123');

    const adminUser = await prisma.user.create({
      data: {
        name: 'John Administrator',
        email: 'admin@school.com',
        password: adminPassword,
        role: 'admin',
        phone: '9999999999',
      }
    });

    const teacherUser = await prisma.user.create({
      data: {
        name: 'Dr. Priya Sharma',
        email: 'teacher@school.com',
        password: teacherPassword,
        role: 'teacher',
        phone: '9876543210',
      }
    });

    const parentUser = await prisma.user.create({
      data: {
        name: 'Rajesh Kumar',
        email: 'parent@school.com',
        password: parentPassword,
        role: 'parent',
        phone: '9876543211',
      }
    });

    console.log('✅ Created users');

    // Create Teachers first (needed for class teacher)
    const teacher1 = await prisma.teacher.create({
      data: {
        userId: teacherUser.id,
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@schoolharmony.edu',
        employeeId: 'T001',
        phone: '9987654321',
        subject: 'Mathematics',
        qualification: 'Ph.D. in Mathematics',
        experience: 10,
        dateOfJoining: new Date('2020-01-15'),
        status: 'active',
      }
    });

    // Create another teacher without user for now or create another user
    // Let's create another user for 2nd teacher
    const teacher2User = await prisma.user.create({
      data: {
        name: 'Rajesh Kumar Singh',
        email: 'rajesh.teacher@school.com',
        password: teacherPassword,
        role: 'teacher',
        phone: '9987654322'
      }
    });

    const teacher2 = await prisma.teacher.create({
      data: {
        userId: teacher2User.id,
        name: 'Rajesh Kumar Singh',
        email: 'rajesh.kumar@schoolharmony.edu',
        employeeId: 'T002',
        phone: '9987654322',
        subject: 'English',
        qualification: 'M.A. in English',
        experience: 8,
        dateOfJoining: new Date('2021-06-01'),
        status: 'active',
      }
    });

    // Link teacher profile to user (inverse is already set by userId on Teacher)
    // But our getMe controller populates teacherProfile.
    // teacherProfile on User is a relation. Prisma manages it via userId on Teacher. 
    // So distinct update not needed if relation is defined correctly.
    // Verify schema: Teacher has userId @unique. User has teacherProfile Teacher?
    // Yes, correctly set.

    console.log('✅ Created teachers');

    // Create Classes
    const class10A = await prisma.class.create({
      data: {
        name: 'Class 10-A',
        grade: 10,
        section: 'A',
        academicYear: '2024-2025',
        capacity: 40,
        room: 'Room 101',
        classTeacherId: teacher1.id,
        // subjects: json
        subjects: [
          { name: 'Mathematics', teacher: teacher1.id },
          { name: 'English', teacher: teacher2.id }
        ]
      }
    });

    const class10B = await prisma.class.create({
      data: {
        name: 'Class 10-B',
        grade: 10,
        section: 'B',
        academicYear: '2024-2025',
        capacity: 40,
        room: 'Room 102',
        // No class teacher yet or same? Use teacher1
        classTeacherId: teacher1.id,
        subjects: [{ name: 'Mathematics', teacher: teacher1.id }]
      }
    });

    const class9A = await prisma.class.create({
      data: {
        name: 'Class 9-A',
        grade: 9,
        section: 'A',
        academicYear: '2024-2025',
        capacity: 40,
        room: 'Room 201',
        classTeacherId: teacher2.id,
        subjects: [{ name: 'English', teacher: teacher2.id }]
      }
    });

    // Update teachers with classes (many-to-many or specific)
    // In our schema: Teacher has classes Class[] @relation("ClassTeacher") 
    // and teachingClasses Class[] @relation("SubjectTeachers")
    // Implicit many-to-many for teachingClasses?
    // Schema: 
    // classes Class[] @relation("ClassTeacher") -> these are classes where they are class teacher.
    // teachingClasses Class[] @relation("SubjectTeachers") -> classes they teach.
    // We need to connect teachingClasses.

    await prisma.teacher.update({
      where: { id: teacher1.id },
      data: {
        teachingClasses: {
          connect: [{ id: class10A.id }, { id: class10B.id }]
        }
      }
    });

    await prisma.teacher.update({
      where: { id: teacher2.id },
      data: {
        teachingClasses: {
          connect: [{ id: class10A.id }, { id: class9A.id }]
        }
      }
    });

    console.log('✅ Created classes');

    // Create Students
    const studentsData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@schoolharmony.edu',
        rollNo: '101',
        classId: class10A.id,
        section: 'A',
        phone: '9876543210',
        dateOfBirth: new Date('2009-05-15'),
        gender: 'male',
        status: 'active',
        fatherName: 'Rajesh Sharma',
        motherName: 'Priya Sharma',
        guardianPhone: '9876543210',
        guardianEmail: 'parent@school.com',
      },
      {
        name: 'Ananya Patel',
        email: 'ananya.patel@schoolharmony.edu',
        rollNo: '102',
        classId: class10A.id,
        section: 'A',
        phone: '9876543211',
        dateOfBirth: new Date('2009-08-22'),
        gender: 'female',
        status: 'active',
        fatherName: 'Amit Patel',
        motherName: 'Kavita Patel',
        guardianPhone: '9876543211',
      },
      {
        name: 'Arjun Reddy',
        email: 'arjun.reddy@schoolharmony.edu',
        rollNo: '103',
        classId: class10B.id,
        section: 'B',
        phone: '9876543212',
        dateOfBirth: new Date('2009-03-10'),
        gender: 'male',
        status: 'active',
        fatherName: 'Venkat Reddy',
        motherName: 'Lakshmi Reddy',
        guardianPhone: '9876543212',
      },
      {
        name: 'Diya Gupta',
        email: 'diya.gupta@schoolharmony.edu',
        rollNo: '104',
        classId: class9A.id,
        section: 'A',
        phone: '9876543213',
        dateOfBirth: new Date('2010-11-05'),
        gender: 'female',
        status: 'active',
        fatherName: 'Suresh Gupta',
        motherName: 'Meera Gupta',
        guardianPhone: '9876543213',
      },
    ];

    // prisma.student.createMany doesn't return created objects with IDs easily in all DBs, 
    // but in Postgres it should. However, Prisma createMany returns { count }.
    // We need IDs for relations. So we loop.
    const createdStudents = [];
    for (const s of studentsData) {
      const student = await prisma.student.create({ data: s });
      createdStudents.push(student);
    }

    // Link first student to parent
    // Parent User has studentProfile Student[]?
    // Schema: studentProfile Student[] // If user is parent
    // Student has userId
    // We need to update student with userId of parent.
    await prisma.student.update({
      where: { id: createdStudents[0].id },
      data: { userId: parentUser.id }
    });

    console.log('✅ Created students');

    // Create Attendance Records
    const attendanceRecords = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      for (const student of createdStudents) {
        attendanceRecords.push({
          studentId: student.id,
          classId: student.classId,
          date,
          status: Math.random() > 0.1 ? 'present' : 'absent',
          markedById: teacherUser.id,
          period: 'full-day',
        });
      }
    }

    await prisma.attendance.createMany({ data: attendanceRecords });
    console.log('✅ Created attendance records');

    // Create Grades
    const grades = [];
    const subjects = ['Mathematics', 'English', 'Science', 'Hindi', 'Social Studies'];

    for (const student of createdStudents) {
      for (const subject of subjects) {
        const marks = Math.floor(Math.random() * 40) + 60; // 60-100
        grades.push({
          studentId: student.id,
          classId: student.classId,
          subject,
          examType: 'mid-term', // Ensure matches enum map: 'mid-term' -> @map('mid-term')? 
          // Schema enum: mid_term @map("mid-term")
          // Prisma client uses the JS name usually: mid_term
          // Wait, if @map is used, DB value is mid-term. Prisma Client Enum key is mid_term.
          // We should use 'mid_term'.
          examName: 'Mid-Term Examination 2024',
          marks,
          maxMarks: 100,
          percentage: marks, // (marks/100)*100
          examDate: new Date('2024-11-15'),
          academicYear: '2024-2025',
          term: '1st Term',
          enteredById: teacherUser.id,
        });
      }
    }

    // Adjust enum values
    const fixedGrades = grades.map(g => ({
      ...g,
      examType: 'mid_term' // Matches keys in Schema Enum
    }));

    await prisma.grade.createMany({ data: fixedGrades });
    console.log('✅ Created grades');

    // Create Fee Records
    const feesData = [];
    for (const student of createdStudents) {
      const feeStructure = {
        tuitionFee: student.classId === class10A.id ? 45000 : 42000,
        labFee: 8000,
        libraryFee: 3000,
        sportsFee: 5000,
        examFee: 2000,
        admissionFee: 0,
        transportFee: 0,
        otherFees: 0,
      };

      const totalFee = Object.values(feeStructure).reduce((a, b) => a + b, 0);
      const paidAmount = Math.random() > 0.5 ? totalFee : Math.floor(totalFee / 2);

      feesData.push({
        studentId: student.id,
        classId: student.classId,
        academicYear: '2024-2025',
        term: 'Annual',
        feeStructure,
        totalFee,
        paidAmount,
        dueAmount: totalFee - paidAmount,
        dueDate: new Date('2025-01-31'),
        status: paidAmount >= totalFee ? 'paid' : paidAmount > 0 ? 'partial' : 'pending',
      });
    }

    await prisma.fee.createMany({ data: feesData });

    console.log('✅ Created fee records');

    // Create Notifications
    await prisma.notification.createMany({
      data: [
        {
          title: 'Parent-Teacher Meeting',
          message: 'Annual PTM is scheduled for next Saturday at 10 AM. All parents are requested to attend.',
          type: 'event',
          priority: 'high',
          recipients: 'all',
          date: new Date(),
          createdById: adminUser.id,
        },
        {
          title: 'Fee Reminder',
          message: 'Please submit pending fees by the end of the month. Late payment will incur additional charges.',
          type: 'reminder',
          priority: 'medium',
          recipients: 'parents',
          date: new Date(),
          createdById: adminUser.id,
        },
        {
          title: 'Republic Day Holiday',
          message: 'School will remain closed on 26th January on the occasion of Republic Day.',
          type: 'notice',
          priority: 'medium',
          recipients: 'all',
          date: new Date(),
          createdById: adminUser.id,
        },
        {
          title: 'Examination Schedule Released',
          message: 'Mid-term examination schedule has been published. Check student portal for details.',
          type: 'academic',
          priority: 'high',
          recipients: 'all',
          date: new Date(),
          createdById: adminUser.id,
        },
      ]
    });

    console.log('✅ Created notifications');

    console.log('');
    console.log('✨ Database seeded successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('');
    console.log('  Admin:');
    console.log('    Email: admin@school.com');
    console.log('    Password: admin123');
    console.log('');
    console.log('  Teacher:');
    console.log('    Email: teacher@school.com');
    console.log('    Password: teacher123');
    console.log('');
    console.log('  Parent:');
    console.log('    Email: parent@school.com');
    console.log('    Password: parent123');
    console.log('');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

seedDatabase();
