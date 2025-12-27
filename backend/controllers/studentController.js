import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse } from '../utils/helpers.js';

// @desc    Get all students
// @route   GET /api/students
// @access  Private
export const getStudents = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, class: className, status, search } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (className) where.classId = className; // Assuming className is ID, need to verify

  // Default to showing only active students unless specific status requested
  if (status) {
    where.status = status;
  } else {
    where.status = { not: 'inactive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { rollNo: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Handle class filter if it's not ID but name?
  // Frontend usually sends ID. If it sends name, we need relation filter.
  // For now assuming ID as per typical REST API design.

  const students = await prisma.student.findMany({
    where,
    include: {
      class: {
        select: { id: true, name: true, grade: true, section: true }
      }
    },
    skip,
    take: pageLimit,
    orderBy: [
      { class: { name: 'asc' } },
      { name: 'asc' }
    ]
  });

  const total = await prisma.student.count({ where });

  sendResponse(res, 200, students, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
export const getStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      class: {
        select: {
          name: true,
          grade: true,
          section: true,
          classTeacher: {
            select: { name: true, email: true, phone: true }
          }
        }
      }
    }
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  res.status(200).json({
    success: true,
    data: student,
  });
});

// Helper to reassign roll numbers alphabetically
const reassignRollNumbers = async (classId) => {
  const students = await prisma.student.findMany({
    where: { classId, status: 'active' },
    orderBy: { name: 'asc' },
    select: { id: true }
  });

  // Two-pass update to avoid unique constraint violations (e.g. taking roll 2 when 2 exists)

  // Pass 1: Set to temporary safe values
  const timestamp = Date.now();
  const tempUpdates = students.map((s, index) =>
    prisma.student.update({
      where: { id: s.id },
      data: { rollNo: `SORT_TEMP_${timestamp}_${index}` }
    })
  );
  await prisma.$transaction(tempUpdates);

  // Pass 2: Set to real sequential values
  const finalUpdates = students.map((s, index) =>
    prisma.student.update({
      where: { id: s.id },
      data: { rollNo: (index + 1).toString() }
    })
  );
  await prisma.$transaction(finalUpdates);
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin only)
export const createStudent = asyncHandler(async (req, res, next) => {
  // Need to handle classId vs class input. Mongoose allowed 'class' field.
  // Prisma needs 'classId'.
  // If req.body.class is provided, map it to classId.
  const data = { ...req.body };
  // Handle class relation
  if (data.class && typeof data.class === 'string' && data.class.trim() !== '') {
    data.classId = data.class;
  }
  // Remove class field to avoid Prisma error (it expects relation input, not string)
  delete data.class;

  // Validate class selection
  if (!data.classId) {
    return next(new ErrorResponse('Please select a class', 400));
  }

  // Auto-assign section from class
  const classInfo = await prisma.class.findUnique({
    where: { id: data.classId }
  });

  if (!classInfo) {
    return next(new ErrorResponse('Selected class not found', 404));
  }
  data.section = classInfo.section;

  // Handle date fields
  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }
  if (data.admissionDate) {
    data.admissionDate = new Date(data.admissionDate);
  }

  // Flatten parentInfo
  if (data.parentInfo) {
    data.fatherName = data.parentInfo.fatherName;
    data.motherName = data.parentInfo.motherName;
    data.guardianPhone = data.parentInfo.guardianPhone;
    data.guardianEmail = data.parentInfo.guardianEmail;
    delete data.parentInfo;
  }

  // Flatten address (assuming it comes as a string from frontend, map to street)
  if (data.address && typeof data.address === 'string') {
    data.street = data.address;
    delete data.address;
  }

  // Set validation bypass for required rollNo (will be fixed by reassign)
  data.rollNo = `TEMP-${Date.now()}`;

  const student = await prisma.student.create({
    data,
  });

  // Reassign roll numbers
  await reassignRollNumbers(student.classId);

  // Fetch updated student to return correct rollNo
  const updatedStudent = await prisma.student.findUnique({ where: { id: student.id } });

  res.status(201).json({
    success: true,
    data: updatedStudent,
  });
});

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin only)
export const updateStudent = asyncHandler(async (req, res, next) => {
  let student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const oldClassId = student.classId;
  const oldName = student.name;

  const data = { ...req.body };
  // Handle class relation
  if (data.class && typeof data.class === 'string' && data.class.trim() !== '') {
    data.classId = data.class;
  }
  // Remove class field to avoid Prisma error (it expects relation input, not string)
  delete data.class;

  // If class is being updated, auto-update section
  if (data.classId) {
    const classInfo = await prisma.class.findUnique({
      where: { id: data.classId }
    });
    if (classInfo) {
      data.section = classInfo.section;
    }
  }

  // Handle date fields
  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }
  if (data.admissionDate) {
    data.admissionDate = new Date(data.admissionDate);
  }

  // Flatten parentInfo
  if (data.parentInfo) {
    data.fatherName = data.parentInfo.fatherName;
    data.motherName = data.parentInfo.motherName;
    data.guardianPhone = data.parentInfo.guardianPhone;
    data.guardianEmail = data.parentInfo.guardianEmail;
    delete data.parentInfo;
  }

  // Flatten address
  if (data.address && typeof data.address === 'string') {
    data.street = data.address;
    delete data.address;
  }

  student = await prisma.student.update({
    where: { id: req.params.id },
    data,
  });

  // Check if re-ordering is needed
  // If class changed, reorder both old and new class
  // If name changed, reorder current class
  if (data.classId && data.classId !== oldClassId) {
    await reassignRollNumbers(oldClassId);
    await reassignRollNumbers(data.classId);
  } else if (data.name && data.name !== oldName) {
    await reassignRollNumbers(oldClassId);
  }

  // Fetch updated student
  const updatedStudent = await prisma.student.findUnique({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    data: updatedStudent,
  });
});

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
export const deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  // Soft delete - change status to inactive and append timestamp to unique fields
  // to allow re-use of email/rollNo
  const timestamp = Date.now();
  await prisma.student.update({
    where: { id: req.params.id },
    data: {
      status: 'inactive',
      email: `${student.email}_deleted_${timestamp}`,
      // Also update rollNo just in case, though it's class-scoped now
      rollNo: `${student.rollNo}_deleted_${timestamp}`
    }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Student deleted successfully',
  });
});

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private
export const getStudentGrades = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const grades = await prisma.grade.findMany({
    where: { studentId: req.params.id },
    orderBy: { examDate: 'desc' }
  });

  res.status(200).json({
    success: true,
    data: grades,
  });
});

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
export const getStudentAttendance = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const { startDate, endDate } = req.query;
  let where = { studentId: req.params.id };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    orderBy: { date: 'desc' }
  });

  // Calculate statistics
  const total = attendance.length;
  const present = attendance.filter(a => a.status === 'present').length;
  const absent = attendance.filter(a => a.status === 'absent').length;
  const late = attendance.filter(a => a.status === 'late').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.status(200).json({
    success: true,
    data: {
      records: attendance,
      statistics: {
        total,
        present,
        absent,
        late,
        percentage,
      },
    },
  });
});

// @desc    Get student fees
// @route   GET /api/students/:id/fees
// @access  Private
export const getStudentFees = asyncHandler(async (req, res, next) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  const fees = await prisma.fee.findMany({
    where: { studentId: req.params.id },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: true // Include payment records if needed
    }
  });

  // Calculate totals
  const totalFee = fees.reduce((sum, fee) => sum + fee.totalFee, 0);
  const totalPaid = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);
  const totalDue = fees.reduce((sum, fee) => sum + fee.dueAmount, 0);

  res.status(200).json({
    success: true,
    data: {
      records: fees,
      summary: {
        totalFee,
        totalPaid,
        totalDue,
      },
    },
  });
});
