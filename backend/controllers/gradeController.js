import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse } from '../utils/helpers.js';

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private
export const getGrades = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, class: classId, subject, examType, academicYear } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (classId) where.classId = classId;
  if (subject) where.subject = subject;
  if (examType) where.examType = examType;
  if (academicYear) where.academicYear = academicYear;

  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: { select: { name: true, rollNo: true, class: { select: { name: true, section: true } } } },
      class: { select: { name: true, grade: true, section: true } },
      enteredBy: { select: { name: true, email: true } }
    },
    skip,
    take: pageLimit,
    orderBy: { examDate: 'desc' }
  });

  const total = await prisma.grade.count({ where });

  sendResponse(res, 200, grades, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private
export const getGrade = asyncHandler(async (req, res, next) => {
  const grade = await prisma.grade.findUnique({
    where: { id: req.params.id },
    include: {
      student: { select: { name: true, rollNo: true, class: { select: { name: true, section: true } } } },
      class: { select: { name: true, grade: true, section: true } },
      enteredBy: { select: { name: true, email: true } }
    }
  });

  if (!grade) {
    return next(new ErrorResponse('Grade not found', 404));
  }

  res.status(200).json({
    success: true,
    data: grade,
  });
});

// @desc    Add grade
// @route   POST /api/grades
// @access  Private (Teacher/Admin)
export const addGrade = asyncHandler(async (req, res, next) => {
  // Calculate percentage if not provided
  const { marks, maxMarks } = req.body;
  let percentage = req.body.percentage;

  if (percentage === undefined && marks !== undefined && maxMarks !== undefined) {
    percentage = (marks / maxMarks) * 100;
  }

  // Calculate grade letter optionally
  let gradeLetter = req.body.grade; // 'A', 'B' etc

  const grade = await prisma.grade.create({
    data: {
      ...req.body,
      percentage,
      grade: gradeLetter,
      enteredById: req.user.id,
      // Ensure classId and studentId are properly mapped from req.body
      classId: req.body.class || req.body.classId,
      studentId: req.body.student || req.body.studentId
    }
  });

  res.status(201).json({
    success: true,
    data: grade,
  });
});

// @desc    Add multiple grades
// @route   POST /api/grades/bulk
// @access  Private (Teacher/Admin)
// @desc    Add multiple grades
// @route   POST /api/grades/bulk
// @access  Private (Teacher/Admin)
// @desc    Add multiple grades
// @route   POST /api/grades/bulk
// @access  Private (Teacher/Admin)
export const addBulkGrades = asyncHandler(async (req, res, next) => {
  const { grades } = req.body;

  if (!grades || !Array.isArray(grades)) {
    return next(new ErrorResponse('Please provide grades array', 400));
  }

  try {
    const results = await Promise.all(
      grades.map(async (grade) => {
        const percentage = (grade.marks / grade.maxMarks) * 100;

        const gradeData = {
          ...grade,
          percentage,
          enteredById: req.user.id,
          classId: grade.class || grade.classId,
          studentId: grade.student || grade.studentId,
          examDate: grade.examDate ? new Date(grade.examDate) : new Date(),
        };

        // Check if grade exists
        const existing = await prisma.grade.findFirst({
          where: {
            studentId: gradeData.studentId,
            subject: gradeData.subject,
            examType: gradeData.examType,
            examName: gradeData.examName,
            academicYear: gradeData.academicYear
          }
        });

        if (existing) {
          // Update
          return await prisma.grade.update({
            where: { id: existing.id },
            data: gradeData
          });
        } else {
          // Create
          return await prisma.grade.create({
            data: gradeData
          });
        }
      })
    );

    res.status(201).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Bulk Grade Error:', error);
    return next(new ErrorResponse('Failed to save grades: ' + error.message, 500));
  }
});

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Teacher/Admin)
export const updateGrade = asyncHandler(async (req, res, next) => {
  let grade = await prisma.grade.findUnique({ where: { id: req.params.id } });

  if (!grade) {
    return next(new ErrorResponse('Grade not found', 404));
  }

  // Recalc logical fields if marks changed
  let { marks, maxMarks } = req.body;

  // If only one is updated, use existing value for other
  if (marks === undefined) marks = grade.marks;
  if (maxMarks === undefined) maxMarks = grade.maxMarks;

  const percentage = (marks / maxMarks) * 100;

  grade = await prisma.grade.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      percentage,
      enteredById: req.user.id,
    },
  });

  res.status(200).json({
    success: true,
    data: grade,
  });
});

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin only)
export const deleteGrade = asyncHandler(async (req, res, next) => {
  const grade = await prisma.grade.findUnique({ where: { id: req.params.id } });

  if (!grade) {
    return next(new ErrorResponse('Grade not found', 404));
  }

  await prisma.grade.delete({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Grade deleted successfully',
  });
});

// @desc    Get student grades
// @route   GET /api/grades/student/:studentId
// @access  Private
export const getStudentGrades = asyncHandler(async (req, res, next) => {
  const { academicYear, subject, examType } = req.query;

  const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  let where = { studentId: req.params.studentId };

  if (academicYear) where.academicYear = academicYear;
  if (subject) where.subject = subject;
  if (examType) where.examType = examType;

  const grades = await prisma.grade.findMany({
    where,
    include: {
      class: { select: { name: true, grade: true, section: true } }
    },
    orderBy: { examDate: 'desc' }
  });

  // Calculate average
  const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
  const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
  const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

  // Group by subject
  const subjectWise = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      grades,
      subjectWise,
      summary: {
        totalMarks,
        totalMaxMarks,
        averagePercentage: averagePercentage.toFixed(2),
        totalExams: grades.length,
      },
    },
  });
});

// @desc    Get class grades
// @route   GET /api/grades/class/:classId
// @access  Private
export const getClassGrades = asyncHandler(async (req, res, next) => {
  const { subject, examType, examName } = req.query;

  const classObj = await prisma.class.findUnique({ where: { id: req.params.classId } });
  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  let where = { classId: req.params.classId };

  if (subject) where.subject = subject;
  if (examType) where.examType = examType;
  if (examName) where.examName = examName;

  const grades = await prisma.grade.findMany({
    where,
    include: {
      student: { select: { name: true, rollNo: true } }
    },
    orderBy: { student: { rollNo: 'asc' } }
  });

  // Calculate class statistics
  const totalStudents = [...new Set(grades.map(g => g.studentId))].length;
  const averageMarks = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.marks, 0) / grades.length
    : 0;
  const averagePercentage = grades.length > 0
    ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
    : 0;

  // Grade distribution
  const gradeDistribution = grades.reduce((acc, grade) => {
    const g = grade.grade || 'N/A';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      grades,
      statistics: {
        totalStudents,
        totalGrades: grades.length,
        averageMarks: averageMarks.toFixed(2),
        averagePercentage: averagePercentage.toFixed(2),
        gradeDistribution,
      },
    },
  });
});

// @desc    Get grade report
// @route   GET /api/grades/report/:studentId
// @access  Private
export const getGradeReport = asyncHandler(async (req, res, next) => {
  const { academicYear } = req.query;

  const student = await prisma.student.findUnique({
    where: { id: req.params.studentId },
    include: { class: { select: { name: true, grade: true, section: true } } }
  });

  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  let where = { studentId: req.params.studentId };
  if (academicYear) where.academicYear = academicYear;

  const grades = await prisma.grade.findMany({
    where,
    orderBy: [{ subject: 'asc' }, { examDate: 'asc' }]
  });

  // Group by subject and calculate averages
  const subjectReport = {};

  grades.forEach(grade => {
    if (!subjectReport[grade.subject]) {
      subjectReport[grade.subject] = {
        subject: grade.subject,
        grades: [],
        totalMarks: 0,
        totalMaxMarks: 0,
      };
    }

    subjectReport[grade.subject].grades.push(grade);
    subjectReport[grade.subject].totalMarks += grade.marks;
    subjectReport[grade.subject].totalMaxMarks += grade.maxMarks;
  });

  // Calculate percentages and overall grade
  Object.keys(subjectReport).forEach(subject => {
    const report = subjectReport[subject];
    report.percentage = (report.totalMarks / report.totalMaxMarks) * 100;

    if (report.percentage >= 90) report.overallGrade = 'A+';
    else if (report.percentage >= 80) report.overallGrade = 'A';
    else if (report.percentage >= 70) report.overallGrade = 'B+';
    else if (report.percentage >= 60) report.overallGrade = 'B';
    else if (report.percentage >= 50) report.overallGrade = 'C';
    else if (report.percentage >= 40) report.overallGrade = 'D';
    else report.overallGrade = 'F';
  });

  // Calculate overall statistics
  const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
  const totalMaxMarks = grades.reduce((sum, g) => sum + g.maxMarks, 0);
  const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      student,
      subjectReport: Object.values(subjectReport),
      overallStatistics: {
        totalMarks,
        totalMaxMarks,
        overallPercentage: overallPercentage.toFixed(2),
        totalSubjects: Object.keys(subjectReport).length,
        totalExams: grades.length,
      },
    },
  });
});
