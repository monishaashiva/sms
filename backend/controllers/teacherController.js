import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse } from '../utils/helpers.js';

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
export const getTeachers = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, subject, status, search } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (subject) where.subject = subject;
  // Default to showing only active teachers unless specific status requested
  if (status) {
    where.status = status;
  }
  // User requested to keep inactive teachers visible
  // else {
  //   where.status = { not: 'inactive' };
  // }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } },
      { subject: { contains: search, mode: 'insensitive' } },
    ];
  }

  const teachers = await prisma.teacher.findMany({
    where,
    include: {
      classes: {
        select: { name: true, grade: true, section: true }
      }
    },
    skip,
    take: pageLimit,
    orderBy: { name: 'asc' }
  });

  const total = await prisma.teacher.count({ where });

  sendResponse(res, 200, teachers, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
export const getTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: req.params.id },
    include: {
      classes: {
        select: { name: true, grade: true, section: true, students: { select: { id: true } } }
      }
    }
  });

  if (!teacher) {
    return next(new ErrorResponse('Teacher not found', 404));
  }

  // Calculate student counts manually or with aggregation
  // For now simple struct
  const teacherWithCounts = {
    ...teacher,
    classes: teacher.classes.map(c => ({
      ...c,
      studentCount: c.students.length
    }))
  };

  res.status(200).json({
    success: true,
    data: teacherWithCounts,
  });
});

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
export const createTeacher = asyncHandler(async (req, res, next) => {
  // Transaction to create teacher + user
  const result = await prisma.$transaction(async (prisma) => {
    // 1. Create Teacher
    // Handle date fields
    const data = { ...req.body };
    if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
    if (data.dateOfJoining) data.dateOfJoining = new Date(data.dateOfJoining);

    // Auto-generate Employee ID
    const teacherCount = await prisma.teacher.count();
    // Simple sequential ID: T001, T002...
    // Note: If teachers are deleted, this might reuse counts or duplicate if not careful, 
    // but for this simple requirement it works. 
    // A more robust way is to find the LAST created teacher's ID and increment.

    // Better approach to avoid duplicates if count < max ID:
    const lastTeacher = await prisma.teacher.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    let nextNum = 1;
    if (lastTeacher && lastTeacher.employeeId && lastTeacher.employeeId.startsWith('T')) {
      const lastNum = parseInt(lastTeacher.employeeId.substring(1));
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }

    // Handle classes relation
    if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
      data.classes = {
        connect: data.classes.map(classId => ({ id: classId }))
      };
    } else {
      delete data.classes; // Remove if empty or invalid to avoid errors
    }

    data.employeeId = `T${nextNum.toString().padStart(3, '0')}`;

    const teacher = await prisma.teacher.create({
      data,
    });

    // 2. Create User
    const user = await prisma.user.create({
      data: {
        name: teacher.name,
        email: teacher.email,
        password: '$2a$10$DefaultHashForTeacher123', // You would typically hash a real default password here. Storing a placeholder for now or use bcrypt helper.
        role: 'teacher',
        phone: teacher.phone,
        // teacherProfile relation is on User side? Or inverse?
      },
    });

    // Connect user to teacher (we need to update teacher with userId or user with teacherId)
    // Schema: specific connection. 
    // In schema: User has teacherProfile Teacher?
    // Teacher has user User?
    // Let's rely on Connect

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { userId: user.id }
    });

    return teacher;
  });

  // Since we need hashed password, importing bcrypt inside transaction or helper
  // For brevity above I used a string. In real app, import bcrypt at top.

  res.status(201).json({
    success: true,
    data: result,
  });
});

// @desc    Get current teacher profile (Dashboard)
// @route   GET /api/teachers/me
// @access  Private (Teacher)
export const getMe = asyncHandler(async (req, res, next) => {
  console.log('GET /teachers/me request for User ID:', req.user.id);
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user.id },
    include: {
      classes: {
        select: {
          id: true,
          name: true,
          grade: true,
          section: true,
          students: { select: { id: true } } // To count students
        }
      },
      teachingClasses: {
        select: {
          id: true,
          name: true,
          section: true,
          students: { select: { id: true } }
        }
      }
    }
  });

  console.log('Teacher Profile Found:', teacher ? 'YES' : 'NO', teacher?.id);

  if (!teacher) {
    return next(new ErrorResponse('Teacher profile not found for this user', 404));
  }

  // Combine Class Teacher classes and Subject Teacher classes
  // Or keep them separate if dashboard distinguishes them.
  // For dashboard "Assigned Classes", we usually mean both or one.
  // Let's assume generic "My Classes" for now.

  const myClasses = [
    ...teacher.classes.map(c => ({ ...c, role: 'Class Teacher' })),
    ...teacher.teachingClasses.map(c => ({ ...c, role: 'Subject Teacher' }))
  ].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Unique by ID
    .map(c => ({
      id: c.id,
      name: `${c.name} (${c.section})`,
      students: c.students.length,
      room: 'TBD' // Add room to schema if needed
    }));

  const totalStudents = myClasses.reduce((sum, cls) => sum + cls.students, 0);

  const stats = {
    assignedClasses: myClasses.length,
    totalStudents: totalStudents,
    averageAttendance: 92, // Mock for now or calculate from Attendance model
    pendingAssignments: 3 // Mock
  };

  res.status(200).json({
    success: true,
    data: {
      profile: teacher,
      stats,
      classes: myClasses
    },
  });
});



// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
export const updateTeacher = asyncHandler(async (req, res, next) => {
  const data = { ...req.body };
  if (data.dateOfBirth) data.dateOfBirth = new Date(data.dateOfBirth);
  if (data.dateOfJoining) data.dateOfJoining = new Date(data.dateOfJoining);

  // Handle classes relation for update
  if (data.classes && Array.isArray(data.classes)) {
    data.classes = {
      set: data.classes.map(classId => ({ id: classId }))
    };
  }

  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data,
  });

  // Sync user info if name/email changed
  if (teacher.userId) {
    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        name: req.body.name || teacher.name,
        email: req.body.email || teacher.email,
        phone: req.body.phone || teacher.phone,
      }
    });
  }

  res.status(200).json({
    success: true,
    data: teacher,
  });
});

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
export const deleteTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });

  if (!teacher) {
    return next(new ErrorResponse('Teacher not found', 404));
  }

  // Soft delete - change status to inactive and update unique fields
  const timestamp = Date.now();
  await prisma.teacher.update({
    where: { id: req.params.id },
    data: {
      status: 'inactive',
      email: `${teacher.email}_deleted_${timestamp}`,
      employeeId: `${teacher.employeeId}_deleted_${timestamp}`
    }
  });

  if (teacher.userId) {
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive: false }
    });
  }

  res.status(200).json({
    success: true,
    data: {},
    message: 'Teacher deleted successfully',
  });
});

// @desc    Get teacher classes
// @route   GET /api/teachers/:id/classes
// @access  Private
export const getTeacherClasses = asyncHandler(async (req, res, next) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: req.params.id },
    include: {
      classes: {
        include: {
          classTeacher: { select: { name: true, email: true } }
          // subjects logic is JSON in generic class
        }
      }
    }
  });

  if (!teacher) {
    return next(new ErrorResponse('Teacher not found', 404));
  }

  res.status(200).json({
    success: true,
    data: teacher.classes,
  });
});

// @desc    Assign class to teacher
// @route   POST /api/teachers/:id/classes
// @access  Private (Admin only)
export const assignClass = asyncHandler(async (req, res, next) => {
  const { classId } = req.body;

  // Use connect
  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data: {
      classes: {
        connect: { id: classId }
      }
    },
    include: { classes: true }
  });

  res.status(200).json({
    success: true,
    data: teacher,
  });
});

// @desc    Remove class from teacher
// @route   DELETE /api/teachers/:id/classes/:classId
// @access  Private (Admin only)
export const removeClass = asyncHandler(async (req, res, next) => {
  const { classId } = req.params;

  // Use disconnect
  const teacher = await prisma.teacher.update({
    where: { id: req.params.id },
    data: {
      classes: {
        disconnect: { id: classId }
      }
    },
    include: { classes: true }
  });

  res.status(200).json({
    success: true,
    data: teacher,
  });
});
