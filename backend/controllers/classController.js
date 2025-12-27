import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse } from '../utils/helpers.js';

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
export const getClasses = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, grade, academicYear } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = { isActive: true };

  if (grade) where.grade = parseInt(grade);
  if (academicYear) where.academicYear = academicYear;

  const classes = await prisma.class.findMany({
    where,
    include: {
      classTeacher: {
        select: { name: true, email: true, phone: true, subject: true }
      }
      // subjects is JSON, so it's included by default, but we can't 'populate' inside JSON.
      // If we need teacher details for subjects, we might need manual fetch or different schema.
      // For now, assuming subjects stores simplified data or client fetches teacher details separately if needed.
    },
    skip,
    take: pageLimit,
    orderBy: [{ grade: 'asc' }, { section: 'asc' }]
  });

  const total = await prisma.class.count({ where });

  // Get student count for each class
  const classesWithCount = await Promise.all(
    classes.map(async (classObj) => {
      const studentCount = await prisma.student.count({
        where: { classId: classObj.id, status: 'active' }
      });
      return {
        ...classObj,
        studentCount,
      };
    })
  );

  sendResponse(res, 200, classesWithCount, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
export const getClass = asyncHandler(async (req, res, next) => {
  const classObj = await prisma.class.findUnique({
    where: { id: req.params.id },
    include: {
      classTeacher: {
        select: { name: true, email: true, phone: true, subject: true }
      }
    }
  });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  // Get student count
  const studentCount = await prisma.student.count({
    where: { classId: classObj.id, status: 'active' }
  });

  res.status(200).json({
    success: true,
    data: {
      ...classObj,
      studentCount,
    },
  });
});

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin only)
export const createClass = asyncHandler(async (req, res, next) => {
  const classObj = await prisma.class.create({
    data: req.body,
  });

  res.status(201).json({
    success: true,
    data: classObj,
  });
});

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin only)
export const updateClass = asyncHandler(async (req, res, next) => {
  let classObj = await prisma.class.findUnique({ where: { id: req.params.id } });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  classObj = await prisma.class.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: classObj,
  });
});

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin only)
export const deleteClass = asyncHandler(async (req, res, next) => {
  const classObj = await prisma.class.findUnique({ where: { id: req.params.id } });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  // Check if there are students in this class
  const studentCount = await prisma.student.count({
    where: { classId: classObj.id, status: 'active' }
  });

  if (studentCount > 0) {
    return next(new ErrorResponse('Cannot delete class with active students', 400));
  }

  // Soft delete
  await prisma.class.update({
    where: { id: req.params.id },
    data: { isActive: false }
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Class deleted successfully',
  });
});

// @desc    Get students in a class
// @route   GET /api/classes/:id/students
// @access  Private
export const getClassStudents = asyncHandler(async (req, res, next) => {
  const classObj = await prisma.class.findUnique({ where: { id: req.params.id } });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  const students = await prisma.student.findMany({
    where: { classId: req.params.id, status: 'active' },
    orderBy: { rollNo: 'asc' }
  });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// @desc    Add subject to class
// @route   POST /api/classes/:id/subjects
// @access  Private (Admin only)
export const addSubject = asyncHandler(async (req, res, next) => {
  const { name, teacher } = req.body;

  // Note: teacher here is assumed to be teacher ID

  const classObj = await prisma.class.findUnique({ where: { id: req.params.id } });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  // Verify teacher exists
  if (teacher) {
    const teacherExists = await prisma.teacher.findUnique({ where: { id: teacher } });
    if (!teacherExists) {
      return next(new ErrorResponse('Teacher not found', 404));
    }
  }

  // Append to existing subjects array (handled as JSON)
  const currentSubjects = Array.isArray(classObj.subjects) ? classObj.subjects : [];
  // Basic generate ID for subject if needed, or just object
  const newSubject = {
    _id: new Date().getTime().toString(), // Mock ID for frontend compatibility
    name,
    teacher
  };

  const updatedSubjects = [...currentSubjects, newSubject];

  const updatedClass = await prisma.class.update({
    where: { id: req.params.id },
    data: { subjects: updatedSubjects }
  });

  res.status(200).json({
    success: true,
    data: updatedClass,
  });
});

// @desc    Remove subject from class
// @route   DELETE /api/classes/:id/subjects/:subjectId
// @access  Private (Admin only)
export const removeSubject = asyncHandler(async (req, res, next) => {
  const classObj = await prisma.class.findUnique({ where: { id: req.params.id } });

  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  const currentSubjects = Array.isArray(classObj.subjects) ? classObj.subjects : [];
  const updatedSubjects = currentSubjects.filter(
    (subject) => subject._id !== req.params.subjectId && subject.id !== req.params.subjectId
  );

  const updatedClass = await prisma.class.update({
    where: { id: req.params.id },
    data: { subjects: updatedSubjects }
  });

  res.status(200).json({
    success: true,
    data: updatedClass,
  });
});
