import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse, generateReceiptNumber } from '../utils/helpers.js';

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Private
export const getFees = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, class: classId, status, academicYear } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (classId) where.classId = classId;
  if (status) where.status = status;
  if (academicYear) where.academicYear = academicYear;

  const fees = await prisma.fee.findMany({
    where,
    include: {
      student: { select: { name: true, rollNo: true, class: { select: { name: true, section: true } } } },
      class: { select: { name: true, grade: true, section: true } },
    },
    skip,
    take: pageLimit,
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.fee.count({ where });

  sendResponse(res, 200, fees, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single fee record
// @route   GET /api/fees/:id
// @access  Private
export const getFee = asyncHandler(async (req, res, next) => {
  const fee = await prisma.fee.findUnique({
    where: { id: req.params.id },
    include: {
      student: { select: { name: true, rollNo: true, email: true, phone: true, fatherName: true, motherName: true } }, // approximating parentInfo
      class: { select: { name: true, grade: true, section: true } },
      payments: {
        include: { receivedBy: { select: { name: true, email: true } } }
      }
    }
  });

  if (!fee) {
    return next(new ErrorResponse('Fee record not found', 404));
  }

  res.status(200).json({
    success: true,
    data: fee,
  });
});

// @desc    Create fee record
// @route   POST /api/fees
// @access  Private (Admin only)
export const createFee = asyncHandler(async (req, res, next) => {
  const fee = await prisma.fee.create({
    data: req.body,
  });

  res.status(201).json({
    success: true,
    data: fee,
  });
});

// @desc    Create fee records for entire class
// @route   POST /api/fees/class/:classId
// @access  Private (Admin only)
export const createClassFees = asyncHandler(async (req, res, next) => {
  const { feeStructure, term, dueDate, academicYear } = req.body;

  const classObj = await prisma.class.findUnique({ where: { id: req.params.classId } });
  if (!classObj) {
    return next(new ErrorResponse('Class not found', 404));
  }

  const students = await prisma.student.findMany({
    where: { classId: req.params.classId, status: 'active' }
  });

  if (students.length === 0) {
    return next(new ErrorResponse('No active students in this class', 404));
  }

  // Calculate total fee from structure
  // Assuming feeStructure is an object like { tuition: 1000, lab: 500 }
  // We need to sum values to get totalFee.
  // Or maybe frontend sends totalFee? Mongoose model calculated it in pre-save.
  // We should calculate it here.
  let totalFee = 0;
  if (feeStructure && typeof feeStructure === 'object') {
    totalFee = Object.values(feeStructure).reduce((a, b) => Number(a) + Number(b), 0);
  }

  const feeRecords = students.map(student => ({
    studentId: student.id,
    classId: req.params.classId,
    feeStructure, // stored as Json
    term,
    dueDate: new Date(dueDate),
    academicYear,
    totalFee: totalFee,
    dueAmount: totalFee, // Initially due = total
    paidAmount: 0,
    status: 'pending' // FeeStatus enum
  }));

  const createdFees = await prisma.fee.createMany({
    data: feeRecords,
  });

  res.status(201).json({
    success: true,
    count: createdFees.count,
    data: createdFees,
  });
});

// @desc    Update fee record
// @route   PUT /api/fees/:id
// @access  Private (Admin only)
export const updateFee = asyncHandler(async (req, res, next) => {
  let fee = await prisma.fee.findUnique({ where: { id: req.params.id } });

  if (!fee) {
    return next(new ErrorResponse('Fee record not found', 404));
  }

  fee = await prisma.fee.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: fee,
  });
});

// @desc    Delete fee record
// @route   DELETE /api/fees/:id
// @access  Private (Admin only)
export const deleteFee = asyncHandler(async (req, res, next) => {
  const fee = await prisma.fee.findUnique({ where: { id: req.params.id } });

  if (!fee) {
    return next(new ErrorResponse('Fee record not found', 404));
  }

  await prisma.fee.delete({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Fee record deleted successfully',
  });
});

// @desc    Record payment
// @route   POST /api/fees/:id/payment
// @access  Private (Admin only)
export const recordPayment = asyncHandler(async (req, res, next) => {
  const { amount, paymentMethod, transactionId, remarks } = req.body;

  // Use transaction to ensure payment record and fee update are atomic
  const result = await prisma.$transaction(async (tx) => {
    const fee = await tx.fee.findUnique({ where: { id: req.params.id } });

    if (!fee) {
      throw new ErrorResponse('Fee record not found', 404);
    }

    if (amount > fee.dueAmount) {
      throw new ErrorResponse('Payment amount exceeds due amount', 400);
    }

    // 1. Create Payment
    const payment = await tx.feePayment.create({
      data: {
        amount,
        paymentMethod,
        transactionId,
        receiptNumber: generateReceiptNumber(),
        remarks,
        receivedById: req.user.id,
        feeId: fee.id
      }
    });

    // 2. Update Fee
    const newPaidAmount = fee.paidAmount + amount;
    const newDueAmount = fee.dueAmount - amount;

    let newStatus = fee.status;
    if (newDueAmount <= 0) {
      newStatus = 'paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'partial';
    }

    const updatedFee = await tx.fee.update({
      where: { id: fee.id },
      data: {
        paidAmount: newPaidAmount,
        dueAmount: newDueAmount,
        status: newStatus
      }
    });

    return { fee: updatedFee, payment };
  });

  res.status(200).json({
    success: true,
    data: result.fee,
    payment: result.payment,
    message: 'Payment recorded successfully',
  });
});

// @desc    Get student fee records
// @route   GET /api/fees/student/:studentId
// @access  Private
export const getStudentFees = asyncHandler(async (req, res, next) => {
  const { academicYear } = req.query;

  const student = await prisma.student.findUnique({ where: { id: req.params.studentId } });
  if (!student) {
    return next(new ErrorResponse('Student not found', 404));
  }

  let where = { studentId: req.params.studentId };
  if (academicYear) where.academicYear = academicYear;

  const fees = await prisma.fee.findMany({
    where,
    include: {
      class: { select: { name: true, grade: true, section: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate totals
  const summary = {
    totalFee: fees.reduce((sum, fee) => sum + fee.totalFee, 0),
    totalPaid: fees.reduce((sum, fee) => sum + fee.paidAmount, 0),
    totalDue: fees.reduce((sum, fee) => sum + fee.dueAmount, 0),
    totalLateFee: fees.reduce((sum, fee) => sum + fee.lateFee, 0),
  };

  res.status(200).json({
    success: true,
    data: {
      records: fees,
      summary,
    },
  });
});

// @desc    Get pending fees
// @route   GET /api/fees/pending
// @access  Private (Admin only)
export const getPendingFees = asyncHandler(async (req, res, next) => {
  const fees = await prisma.fee.findMany({
    where: {
      status: { in: ['pending', 'partial', 'overdue'] },
      dueAmount: { gt: 0 }
    },
    include: {
      student: { select: { name: true, rollNo: true, email: true, phone: true } },
      class: { select: { name: true, grade: true, section: true } }
    },
    orderBy: { dueDate: 'asc' }
  });

  // Calculate totals
  const summary = {
    totalRecords: fees.length,
    totalDueAmount: fees.reduce((sum, fee) => sum + fee.dueAmount, 0),
    pending: fees.filter(f => f.status === 'pending').length,
    partial: fees.filter(f => f.status === 'partial').length,
    overdue: fees.filter(f => f.status === 'overdue').length,
  };

  res.status(200).json({
    success: true,
    data: {
      records: fees,
      summary,
    },
  });
});

// @desc    Get overdue fees
// @route   GET /api/fees/overdue
// @access  Private (Admin only)
export const getOverdueFees = asyncHandler(async (req, res, next) => {
  const fees = await prisma.fee.findMany({
    where: {
      status: 'overdue',
      dueAmount: { gt: 0 },
      dueDate: { lt: new Date() }
    },
    include: {
      student: { select: { name: true, rollNo: true, email: true, phone: true } },
      class: { select: { name: true, grade: true, section: true } }
    },
    orderBy: { dueDate: 'asc' }
  });

  const totalOverdue = fees.reduce((sum, fee) => sum + fee.dueAmount, 0);

  res.status(200).json({
    success: true,
    count: fees.length,
    totalOverdue,
    data: fees,
  });
});

// @desc    Apply discount
// @route   POST /api/fees/:id/discount
// @access  Private (Admin only)
export const applyDiscount = asyncHandler(async (req, res, next) => {
  const { amount, reason } = req.body;

  const result = await prisma.$transaction(async (tx) => {
    const fee = await tx.fee.findUnique({ where: { id: req.params.id } });

    if (!fee) {
      throw new ErrorResponse('Fee record not found', 404);
    }

    if (amount > fee.totalFee) {
      throw new ErrorResponse('Discount amount exceeds total fee', 400);
    }

    // Create discount record
    await tx.feeDiscount.create({
      data: {
        amount,
        reason,
        feeId: fee.id,
        appliedById: req.user.id
      }
    });

    // Update fee totals if needed?
    // Mongoose had totalFee. Typically discount reduces totalFee or is subtracted during payment?
    // Assuming discount reduces the due amount directly
    const newDueAmount = fee.dueAmount - amount;

    const updatedFee = await tx.fee.update({
      where: { id: fee.id },
      data: {
        dueAmount: newDueAmount,
        // If we want to track total discounts on fee model directly, we'd add field. 
        // But we have relations so we can sum them up separately.
        // For sync with FE expecting discount obj on fee, we might need to adjust.
      }
    });

    return updatedFee;
  });

  res.status(200).json({
    success: true,
    data: result,
    message: 'Discount applied successfully',
  });
});

// @desc    Get fee collection report
// @route   GET /api/fees/report
// @access  Private (Admin only)
export const getFeeReport = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, classId } = req.query;

  let where = {};

  if (classId) where.classId = classId;

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const fees = await prisma.fee.findMany({
    where,
    include: { discounts: true } // Include discounts to sum them
  });

  const report = {
    totalFees: fees.reduce((sum, fee) => sum + fee.totalFee, 0),
    totalCollected: fees.reduce((sum, fee) => sum + fee.paidAmount, 0),
    totalDue: fees.reduce((sum, fee) => sum + fee.dueAmount, 0),
    totalDiscount: fees.reduce((sum, fee) => sum + fee.discounts.reduce((dSum, d) => dSum + d.amount, 0), 0),
    totalLateFee: fees.reduce((sum, fee) => sum + fee.lateFee, 0),
    statusBreakdown: {
      paid: fees.filter(f => f.status === 'paid').length,
      pending: fees.filter(f => f.status === 'pending').length,
      partial: fees.filter(f => f.status === 'partial').length,
      overdue: fees.filter(f => f.status === 'overdue').length,
    },
  };

  res.status(200).json({
    success: true,
    data: report,
  });
});
