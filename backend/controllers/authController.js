import prisma from '../config/prisma.js';
import ErrorResponse from '../utils/errorResponse.js';
import { asyncHandler } from '../utils/helpers.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Helper to generate token
const getSignedJwtToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Helper to check password
const matchPassword = async (enteredPassword, userPassword) => {
  return await bcrypt.compare(enteredPassword, userPassword);
};

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedJwtToken(user);

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Remove password from output
  const userResponse = { ...user };
  delete userResponse.password;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userResponse,
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  });

  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'parent',
      phone,
    },
  });

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  console.log('Login Request:', { email, passwordLength: password?.length });

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('Login failed: User not found for email:', email);
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  console.log('User found:', user.id, 'Role:', user.role);

  // Check if password matches
  const isMatch = await matchPassword(password, user.password);

  console.log('Password match result:', isMatch);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      studentProfile: {
        select: {
          name: true,
          class: { select: { name: true, section: true } } // Adjusted based on relation
        }
      },
      teacherProfile: {
        select: {
          subject: true,
          classes: { select: { name: true, section: true } } // Adjusted relation
        }
      }
    }
  });

  // Transform response to match frontend expectation (children field)
  const userResponse = { ...user };
  delete userResponse.password;

  // Flatten student profile to children for parent view compatibility
  if (userResponse.studentProfile && userResponse.studentProfile.length > 0) {
    userResponse.children = userResponse.studentProfile;
    delete userResponse.studentProfile;
  }

  res.status(200).json({
    success: true,
    data: userResponse,
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      name,
      email,
      phone,
    },
  });

  const userResponse = { ...user };
  delete userResponse.password;

  res.status(200).json({
    success: true,
    data: userResponse,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  // Check current password
  const isMatch = await matchPassword(req.body.currentPassword, user.password);

  if (!isMatch) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      password: hashedPassword,
    },
  });

  sendTokenResponse(updatedUser, 200, res);
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
    message: 'Logged out successfully',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { email: req.body.email },
  });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  res.status(200).json({
    success: true,
    data: 'Password reset email sent',
  });
});
