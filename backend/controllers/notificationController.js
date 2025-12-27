import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler, pagination, sendResponse } from '../utils/helpers.js';

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, type, recipients, isActive = true } = req.query;
  const { skip, limit: pageLimit } = pagination(page, limit);

  let where = {};

  if (type) where.type = type;
  // Convert isActive string to boolean if needed, though usually query params are strings
  if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

  // Filter by recipients based on user role
  if (recipients) {
    where.recipients = recipients;
  } else if (req.user.role !== 'admin') {
    // Non-admin users only see notifications relevant to them
    const userRole = req.user.role;
    where.OR = [
      { recipients: 'all' },
      { recipients: userRole === 'teacher' ? 'teachers' : userRole === 'parent' ? 'parents' : userRole },
    ];
  }
  // Admins see all notifications if no specific recipient filter is passed

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      createdBy: { select: { name: true, email: true } },
      readBy: {
        where: { userId: req.user.id },
        select: { readAt: true } // Just to check if read
      }
    },
    skip,
    take: pageLimit,
    orderBy: { date: 'desc' }
  });

  const total = await prisma.notification.count({ where });

  // Map to include 'isRead' field for convenience? 
  // Frontend might expect simple read check or array check.
  // Mongoose populate returned array of read status.
  // We'll keep it as 'readBy' array for compatibility, but it will only contain current user if read.

  sendResponse(res, 200, notifications, {
    page: parseInt(page),
    limit: pageLimit,
    total,
    pages: Math.ceil(total / pageLimit),
  });
});

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
export const getNotification = asyncHandler(async (req, res, next) => {
  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: { select: { name: true, email: true, role: true } },
      readBy: {
        select: { userId: true, readAt: true }
      }
    }
  });

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Mark as read if not already
  const alreadyRead = notification.readBy.some(
    (read) => read.userId === req.user.id
  );

  if (!alreadyRead) {
    await prisma.notificationRead.create({
      data: {
        notificationId: notification.id,
        userId: req.user.id
      }
    });
    // Optimistic update for response
    notification.readBy.push({ userId: req.user.id, readAt: new Date() });
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Admin only)
export const createNotification = asyncHandler(async (req, res, next) => {
  const notification = await prisma.notification.create({
    data: {
      ...req.body,
      createdById: req.user.id,
    }
  });

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin only)
export const updateNotification = asyncHandler(async (req, res, next) => {
  let notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: req.body,
  });

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin only)
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Delete read records first due to constraints? 
  // Prisma handles cascade if configured, but let's be safe or rely on schema @relation(onDelete: Cascade)
  // Our schema didn't specify Cascade, so we should delete relations manually.
  await prisma.notificationRead.deleteMany({ where: { notificationId: req.params.id } });

  await prisma.notification.delete({ where: { id: req.params.id } });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Notification deleted successfully',
  });
});

// @desc    Get recent notifications
// @route   GET /api/notifications/recent
// @access  Private
export const getRecentNotifications = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const userRole = req.user.role;
  const where = {
    isActive: true,
    OR: [
      { recipients: 'all' },
      { recipients: userRole === 'teacher' ? 'teachers' : userRole === 'parent' ? 'parents' : userRole },
    ],
    // Expiry check
    // OR: [ { expiryDate: null }, { expiryDate: { gte: now } } ]
    AND: [
      {
        OR: [
          { expiryDate: null },
          { expiryDate: { gte: new Date() } }
        ]
      }
    ]
  };

  const notifications = await prisma.notification.findMany({
    where,
    include: {
      createdBy: { select: { name: true } },
      readBy: {
        where: { userId: req.user.id },
        select: { userId: true }
      }
    },
    take: limit,
    orderBy: { date: 'desc' }
  });

  // Mark unread count
  // Filter where readBy array is empty (since we filtered readBy by userId)
  const unreadCount = notifications.filter(n => n.readBy.length === 0).length;

  res.status(200).json({
    success: true,
    unreadCount,
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Check if already read
  const alreadyRead = await prisma.notificationRead.findUnique({
    where: {
      notificationId_userId: {
        notificationId: req.params.id,
        userId: req.user.id
      }
    }
  });

  if (!alreadyRead) {
    await prisma.notificationRead.create({
      data: {
        notificationId: req.params.id,
        userId: req.user.id
      }
    });
  }

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read/all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  const userRole = req.user.role;

  // Find all relevant notifications
  const notifications = await prisma.notification.findMany({
    where: {
      isActive: true,
      OR: [
        { recipients: 'all' },
        { recipients: userRole === 'teacher' ? 'teachers' : userRole === 'parent' ? 'parents' : userRole },
      ],
      // Find ones NOT read by user. SQL/Prisma "none" filter logic is tricky here.
      // Easier to fetch and filter or just try to create ignore duplicates.
    },
    include: {
      readBy: { where: { userId: req.user.id }, select: { userId: true } }
    }
  });

  const unreadNotifications = notifications.filter(n => n.readBy.length === 0);

  // Create read records
  if (unreadNotifications.length > 0) {
    await prisma.notificationRead.createMany({
      data: unreadNotifications.map(n => ({
        notificationId: n.id,
        userId: req.user.id
      })),
      skipDuplicates: true
    });
  }

  res.status(200).json({
    success: true,
    message: `${unreadNotifications.length} notifications marked as read`,
  });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const userRole = req.user.role;

  // We need to count notifications where NOT EXISTS in read table.
  // Prisma doesn't support "NOT EXISTS" related query easily in `count`.
  // findMany with include is easier for logic, though less performant for huge datasets.

  const notifications = await prisma.notification.findMany({
    where: {
      isActive: true,
      OR: [
        { recipients: 'all' },
        { recipients: userRole === 'teacher' ? 'teachers' : userRole === 'parent' ? 'parents' : userRole },
      ],
    },
    include: {
      readBy: { where: { userId: req.user.id } }
    }
  });

  const unreadCount = notifications.filter(n => n.readBy.length === 0).length;

  res.status(200).json({
    success: true,
    unreadCount: unreadCount,
  });
});
