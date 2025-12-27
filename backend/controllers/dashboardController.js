import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, calculateAttendancePercentage, getDateRange, getCurrentAcademicYear } from '../utils/helpers.js';

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
export const getAdminDashboard = asyncHandler(async (req, res, next) => {
  const academicYear = req.query.academicYear || getCurrentAcademicYear();

  // Total counts
  const totalStudents = await prisma.student.count({ where: { status: 'active' } });
  const totalTeachers = await prisma.teacher.count({ where: { status: 'active' } });
  const totalClasses = await prisma.class.count({ where: { isActive: true } });

  // Attendance stats (last 30 days)
  const { startDate, endDate } = getDateRange('month');
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: { gte: startDate, lte: endDate }
    }
  });

  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter(a => a.status === 'present').length;
  const averageAttendance = calculateAttendancePercentage(presentCount, totalAttendance);

  // Fee stats
  const feeRecords = await prisma.fee.findMany({ where: { academicYear } });
  const feesCollected = feeRecords.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const pendingFees = feeRecords.reduce((sum, fee) => sum + fee.dueAmount, 0);
  const totalFees = feeRecords.reduce((sum, fee) => sum + fee.totalFee, 0);

  // Recent admissions (last 30 days)
  const recentAdmissions = await prisma.student.count({
    where: {
      admissionDate: { gte: startDate },
      status: 'active'
    }
  });

  // Upcoming events
  const upcomingEvents = await prisma.notification.count({
    where: {
      type: 'event',
      date: { gte: new Date() },
      isActive: true
    }
  });

  // Recent notifications
  const recentNotifications = await prisma.notification.findMany({
    where: { isActive: true },
    take: 5,
    orderBy: { date: 'desc' },
    select: { title: true, message: true, type: true, date: true }
  });

  // Grade distribution
  const recentGrades = await prisma.grade.findMany({
    where: { academicYear },
    take: 100,
    select: { grade: true }
  });

  const gradeDistribution = recentGrades.reduce((acc, g) => {
    const grade = g.grade || 'N/A';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  // Monthly admissions (last 6 months)
  const monthlyAdmissions = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const count = await prisma.student.count({
      where: {
        admissionDate: { gte: monthStart, lte: monthEnd }
      }
    });

    monthlyAdmissions.push({
      month: monthStart.toLocaleString('default', { month: 'short' }),
      count,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalStudents,
        totalTeachers,
        totalClasses,
        averageAttendance,
      },
      finance: {
        feesCollected,
        pendingFees,
        totalFees,
        collectionPercentage: totalFees > 0 ? Math.round((feesCollected / totalFees) * 100) : 0,
      },
      recent: {
        recentAdmissions,
        upcomingEvents,
      },
      recentNotifications,
      charts: {
        gradeDistribution,
        monthlyAdmissions,
      },
    },
  });
});

// @desc    Get teacher dashboard stats
// @route   GET /api/dashboard/teacher
// @access  Private (Teacher only)
export const getTeacherDashboard = asyncHandler(async (req, res, next) => {
  // Get teacher profile
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id }, // Need unique constraint on userId in Teacher model
    include: {
      classes: { select: { name: true, grade: true, section: true } }
    }
  });

  if (!teacher) {
    return next(new ErrorResponse('Teacher profile not found', 404));
  }

  const classIds = teacher.classes.map(c => c.id);

  // Total students in teacher's classes
  const totalStudents = await prisma.student.count({
    where: {
      classId: { in: classIds },
      status: 'active'
    }
  });

  // Today's attendance
  const today = new Date();
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const todayAttendance = await prisma.attendance.findMany({
    where: {
      classId: { in: classIds },
      date: { gte: todayStart, lte: todayEnd }
    }
  });

  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const averageAttendance = calculateAttendancePercentage(presentToday, todayAttendance.length);

  // Pending assignments/grades
  const academicYear = getCurrentAcademicYear();
  const recentGrades = await prisma.grade.count({
    where: {
      classId: { in: classIds },
      academicYear,
      enteredById: req.user.id,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  // Upcoming exams
  const upcomingExams = await prisma.notification.count({
    where: {
      type: 'academic',
      recipients: { in: ['all', 'teachers'] },
      date: { gte: new Date() },
      isActive: true
    }
  });

  // Classes with student counts
  const classesWithCounts = await Promise.all(
    teacher.classes.map(async (classObj) => {
      const studentCount = await prisma.student.count({
        where: {
          classId: classObj.id,
          status: 'active'
        }
      });

      return {
        ...classObj,
        studentCount,
      };
    })
  );

  // Recent notifications
  const recentNotifications = await prisma.notification.findMany({
    where: {
      isActive: true,
      recipients: { in: ['all', 'teachers'] }
    },
    take: 5,
    orderBy: { date: 'desc' },
    select: { title: true, message: true, type: true, date: true }
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        assignedClasses: teacher.classes.length,
        totalStudents,
        averageAttendance,
        recentGradesEntered: recentGrades,
        upcomingExams,
      },
      classes: classesWithCounts,
      recentNotifications,
    },
  });
});

// @desc    Get parent dashboard stats
// @route   GET /api/dashboard/parent
// @access  Private (Parent only)
export const getParentDashboard = asyncHandler(async (req, res, next) => {
  // Get parent's children
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      studentProfile: { // Mapped as children relation in schema possibly? "children" implies studentProfile
        include: {
          class: {
            include: { classTeacher: { select: { name: true, email: true } } }
          }
        }
      }
    }
  });

  const children = user.studentProfile || [];

  if (children.length === 0) {
    return next(new ErrorResponse('No children found for this parent', 404));
  }

  // Get data for all children
  const childrenData = await Promise.all(
    children.map(async (child) => {
      const academicYear = getCurrentAcademicYear();

      // Attendance
      const { startDate } = getDateRange('month');
      const attendance = await prisma.attendance.findMany({
        where: {
          studentId: child.id,
          date: { gte: startDate }
        }
      });

      const presentCount = attendance.filter(a => a.status === 'present').length;
      const attendancePercentage = calculateAttendancePercentage(presentCount, attendance.length);

      // Grades
      const grades = await prisma.grade.findMany({
        where: {
          studentId: child.id,
          academicYear
        },
        orderBy: { examDate: 'desc' },
        take: 5
      });

      // Calculate average grade
      let averagePercentage = 0;
      if (grades.length > 0) {
        const totalPercentage = grades.reduce((sum, g) => sum + g.percentage, 0);
        averagePercentage = totalPercentage / grades.length;
      }

      // Overall grade
      let overallGrade = 'N/A';
      if (averagePercentage >= 90) overallGrade = 'A+';
      else if (averagePercentage >= 80) overallGrade = 'A';
      else if (averagePercentage >= 70) overallGrade = 'B+';
      else if (averagePercentage >= 60) overallGrade = 'B';
      else if (averagePercentage >= 50) overallGrade = 'C';
      else if (averagePercentage >= 40) overallGrade = 'D';
      else if (averagePercentage > 0) overallGrade = 'F';

      // Fees
      const feeRecords = await prisma.fee.findMany({
        where: {
          studentId: child.id,
          academicYear
        }
      });

      const totalDue = feeRecords.reduce((sum, fee) => sum + fee.dueAmount, 0);
      const feeStatus = totalDue > 0 ? 'Pending' : 'Paid';
      const nextPaymentDue = feeRecords.find(f => f.dueAmount > 0)?.dueDate || null;

      return {
        childId: child.id,
        childName: child.name,
        class: `${child.class.grade}-${child.class.section}`,
        rollNo: child.rollNo,
        attendance: attendancePercentage,
        overallGrade,
        averagePercentage: averagePercentage.toFixed(2),
        recentGrades: grades,
        feeStatus,
        totalDue,
        nextPaymentDue,
      };
    })
  );

  // Notifications for parents
  const notifications = await prisma.notification.findMany({
    where: {
      isActive: true,
      recipients: { in: ['all', 'parents'] }
    },
    take: 5,
    orderBy: { date: 'desc' },
    select: { title: true, message: true, type: true, date: true }
  });

  res.status(200).json({
    success: true,
    data: {
      children: childrenData,
      notifications,
    },
  });
});
