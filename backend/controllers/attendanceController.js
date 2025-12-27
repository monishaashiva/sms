import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse, calculateAttendancePercentage } from '../utils/helpers.js';

// @desc    Get attendance records
// @route   GET /api/attendance
// @access  Private
export const getAttendance = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, class: classId, date, status, startDate, endDate } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (classId) where.classId = classId;
  if (status) where.status = status;

  if (date) {
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    where.date = {
      gte: startOfDay,
      lt: endOfDay,
    };
  }

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: { select: { name: true, rollNo: true, class: { select: { name: true, section: true } } } },
      class: { select: { name: true, grade: true, section: true } },
      markedBy: { select: { name: true, email: true } },
    },
    skip,
    take: pageLimit,
    orderBy: { date: 'desc' }
  });

  const total = await prisma.attendance.count({ where });

  sendResponse(res, 200, attendance, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private (Teacher/Admin)
export const markAttendance = asyncHandler(async (req, res, next) => {
  const { attendanceRecords } = req.body;

  if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
    return next(new ErrorResponse('Please provide attendance records', 400));
  }

  const createdRecords = [];

  // Using transaction for bulk operation safety
  await prisma.$transaction(async (tx) => {
    for (const record of attendanceRecords) {
      // Upsert: Create if not exists, update if exists (based on unique constraint)
      const input = {
        date: record.date ? new Date(record.date) : new Date(),
        status: record.status,
        remarks: record.remarks,
        period: record.period || 'full-day',
        subject: record.subject,
        studentId: record.student,
        classId: record.class || record.classId, // Ensure classId is present
        markedById: req.user.id
      };

      // Need valid classId. If not in record, fetch it from student? 
      // Typically frontend sends it. 
      if (!input.classId) {
        const student = await tx.student.findUnique({ where: { id: input.studentId }, select: { classId: true } });
        input.classId = student.classId;
      }

      const attendance = await tx.attendance.upsert({
        where: {
          studentId_date_period: {
            studentId: input.studentId,
            date: input.date,
            period: input.period
          }
        },
        update: {
          status: input.status,
          remarks: input.remarks,
          markedById: req.user.id
        },
        create: input
      });
      createdRecords.push(attendance);
    }
  });

  res.status(201).json({
    success: true,
    count: createdRecords.length,
    data: createdRecords,
  });
});

// @desc    Update attendance
// @route   PUT /api/attendance/:id
// @access  Private (Teacher/Admin)
export const updateAttendance = asyncHandler(async (req, res, next) => {
  let attendance = await prisma.attendance.findUnique({ where: { id: req.params.id } });

  if (!attendance) {
    return next(new ErrorResponse('Attendance record not found', 404));
  }

  attendance = await prisma.attendance.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      markedById: req.user.id,
    },
  });

  res.status(200).json({
    success: true,
    data: attendance,
  });
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private (Admin only)
export const deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await prisma.attendance.findUnique({ where: { id: req.params.id } });

  if (!attendance) {
    return next(new ErrorResponse('Attendance record not found', 404));
  }

  await prisma.attendance.delete({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Attendance record deleted successfully',
  });
});

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
// @desc    Get student attendance
export const getStudentAttendance = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  let where = { studentId: req.params.studentId };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  // Calculate statistics
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const excused = attendance.filter(a => a.status === 'excused').length;

  res.status(200).json({
    success: true,
    data: {
      records: attendance,
      statistics: {
        total,
        present,
        absent,
        late,
        excused,
        percentage: calculateAttendancePercentage(present, total),
      },
    },
  });
});

// @desc    Get class attendance
// @route   GET /api/attendance/class/:classId
// @access  Private
export const getClassAttendance = asyncHandler(async (req, res, next) => {
  const { date } = req.query;

  const classObj = await prisma.class.findUnique({ where: { id: req.params.classId } });
  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  let where = { classId: req.params.classId };
  let dateQuery = {};

  if (date) {
    const searchDate = new Date(date);
    dateQuery = {
      gte: new Date(searchDate.setHours(0, 0, 0, 0)),
      lt: new Date(searchDate.setHours(23, 59, 59, 999)),
    };
  } else {
    // Today's attendance by default
    const today = new Date();
    dateQuery = {
      gte: new Date(today.setHours(0, 0, 0, 0)),
      lt: new Date(today.setHours(23, 59, 59, 999)),
    };
  }

  where.date = dateQuery;

  const attendance = await prisma.attendance.findMany({
    where,
    include: {
      student: { select: { name: true, rollNo: true } }
    },
    orderBy: { student: { rollNo: 'asc' } }
  });

  // Get all students in the class
  const allStudents = await prisma.student.findMany({
    where: { classId: req.params.classId, status: 'active' },
    orderBy: { rollNo: 'asc' }
  });

  // Mark students with no attendance as not marked
  const attendanceMap = new Map();
  attendance.forEach(a => {
    attendanceMap.set(a.studentId, a);
  });

  const completeAttendance = allStudents.map(student => {
    const record = attendanceMap.get(student.id);
    return record ? {
      ...record,
      student: { // Format like popluate
        _id: student.id,
        name: student.name,
        rollNo: student.rollNo
      }
    } : {
      student: {
        _id: student.id,
        name: student.name,
        rollNo: student.rollNo,
      },
      status: 'not-marked',
      date: dateQuery.gte,
    };
  });

  // Calculate statistics
  const total = allStudents.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const notMarked = total - attendance.length;

  res.status(200).json({
    success: true,
    data: {
      records: completeAttendance,
      statistics: {
        total,
        present,
        absent,
        late,
        notMarked,
        percentage: calculateAttendancePercentage(present, total),
      },
    },
  });
});

// @desc    Get attendance report
// @route   GET /api/attendance/report
// @access  Private (Admin/Teacher)
export const getAttendanceReport = asyncHandler(async (req, res, next) => {
  const { classId, startDate, endDate } = req.query;

  if (!classId || !startDate || !endDate) {
    return next(new ErrorResponse('Please provide class, start date and end date', 400));
  }

  // 1. Get total distinct days attendance was taken for this class in the range
  const classAttendanceDays = await prisma.attendance.groupBy({
    by: ['date'],
    where: {
      classId: classId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  const totalClassDays = classAttendanceDays.length;

  // 2. Get all students
  const students = await prisma.student.findMany({
    where: { classId: classId, status: 'active' },
    orderBy: { rollNo: 'asc' } // Ensure deterministic order
  });

  const report = await Promise.all(
    students.map(async (student) => {
      const attendance = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });

      const present = attendance.filter(a => a.status === 'present').length;
      const absent = attendance.filter(a => a.status === 'absent').length;
      const late = attendance.filter(a => a.status === 'late').length;

      // Calculate percentage based on total class days, avoiding divide by zero
      // If a student joined late, this might be strict, but "Total Class" usually implies class working days.
      // Alternatively, we could count only days since their admission, but user asked for "Same for all".
      const percentage = totalClassDays > 0 ? Math.round((present / totalClassDays) * 100) : 0;

      return {
        student: {
          _id: student.id,
          name: student.name,
          rollNo: student.rollNo,
        },
        total: totalClassDays, // Uniform total
        present,
        absent,
        late,
        percentage,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: report,
  });
});
