import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { TenantRequest } from '../middleware/tenant.middleware';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { emailService } from '../services/email.service';

// Generate JWT token
const generateToken = (userId: string, tenantId: string, email: string, role: string) => {
  return jwt.sign(
    { userId, tenantId, email, role },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register
export const register = async (req: TenantRequest, res: Response) => {
  const { email, password, firstName, lastName, tenantId, tenantSlug } = req.body;

  // Find tenant by ID or slug
  let tenant;
  if (tenantId) {
    tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  } else if (tenantSlug) {
    tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });
  }

  if (!tenant) {
    throw new AppError('Tenant not found', 404);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email, tenantId: tenant.id },
  });

  if (existingUser) {
    throw new AppError('User already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user (email not verified yet)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      tenantId: tenant.id,
      role: 'viewer', // Default role
      emailVerified: false, // Email not verified yet
    },
  });

  // Generate verification token (valid for 24 hours)
  const verificationToken = jwt.sign(
    { userId: user.id, email: user.email, type: 'email_verification' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );

  // Send verification email
  try {
    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName || undefined);
  } catch (error: any) {
    // Log error but don't fail registration
    console.error('Failed to send verification email:', error);
  }

  // Generate auth token (user can login but may have limited access)
  const token = generateToken(user.id, user.tenantId, user.email, user.role);

  res.status(201).json({
    message: 'User registered successfully. Please check your email to verify your account.',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined, // Only in dev mode
  });
};

// Login
export const login = async (req: TenantRequest, res: Response) => {
  const { email, password, tenantId, tenantSlug } = req.body;

  // Find tenant by ID or slug
  let tenant;
  if (tenantId) {
    tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  } else if (tenantSlug) {
    tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
  } else {
    tenant = await prisma.tenant.findFirst();
  }

  if (!tenant) {
    throw new AppError('Invalid credentials', 401);
  }

  // Find user
  const user = await prisma.user.findFirst({
    where: {
      email,
      tenantId: tenant.id,
      isActive: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if email is verified (warning only, not blocking)
  if (!user.emailVerified) {
    // User can login but should verify email
    // In production, you might want to require email verification
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate token
  const token = generateToken(user.id, user.tenantId, user.email, user.role);

  res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      emailVerified: user.emailVerified, // Include verification status
    },
    ...(user.emailVerified ? {} : { 
      warning: 'Please verify your email to access all features' 
    }),
  });
};

// Get current user
export const getCurrentUser = async (req: TenantRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      tenantId: true,
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          primaryColor: true,
          secondaryColor: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return res.json({ user });
};

// Refresh token
export const refreshToken = async (req: TenantRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization token required', 401);
    }

    const token = authHeader.substring(7);
    
    // Verify token (even if expired, we can still decode it)
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', {
        ignoreExpiration: true, // Allow expired tokens for refresh
      });
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }

    // Check if user still exists and is active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        tenantId: decoded.tenantId,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found or inactive', 401);
    }

    // Generate new token
    const newToken = generateToken(user.id, user.tenantId, user.email, user.role);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to refresh token', 500);
  }
};

// Forgot password
export const forgotPassword = async (req: TenantRequest, res: Response) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findFirst({
      where: { email },
      include: { tenant: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password_reset' },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken, user.firstName || undefined);
    } catch (error: any) {
      console.error('Failed to send password reset email:', error);
      // Still return success to prevent email enumeration
    }

    res.json({ 
      message: 'If an account with this email exists, a password reset link has been sent.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined, // Only in dev mode
      resetUrl: process.env.NODE_ENV === 'development' 
        ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
        : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password
export const resetPassword = async (req: TenantRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, email: decoded.email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify email
export const verifyEmail = async (req: TenantRequest, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      
      // Check token type
      if (decoded.type !== 'email_verification') {
        throw new AppError('Invalid token type', 400);
      }
    } catch (error) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        id: decoded.userId, 
        email: decoded.email 
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.json({ 
        message: 'Email already verified',
        user: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });
    }

    // Update user to verified
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
      },
    });

    res.json({
      message: 'Email verified successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to verify email', 500);
  }
};

// Resend verification email
export const resendVerificationEmail = async (req: TenantRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, a verification email has been sent.' 
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.json({ 
        message: 'Email is already verified',
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'email_verification' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName || undefined);
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
    }

    res.json({ 
      message: 'If an account with this email exists, a verification email has been sent.',
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to resend verification email', 500);
  }
};

// Logout
export const logout = async (_req: TenantRequest, res: Response) => {
  // Implement logout logic (invalidate token/session)
  return res.json({ message: 'Logout successful' });
};
