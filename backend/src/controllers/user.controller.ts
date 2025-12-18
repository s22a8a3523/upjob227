import { Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { TenantRequest } from '../middleware/tenant.middleware';

const sanitizeUser = (u: any) => {
  if (!u) return u;
  const { passwordHash, ...rest } = u;
  return rest;
};

export const listUsers = async (req: TenantRequest, res: Response) => {
  const { 
    page = 1, 
    limit = 20, 
    search, 
    role, 
    isActive 
  } = req.query;

  // Build where clause
  const where: any = { tenantId: req.tenantId! };
  
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    where.role = role as string;
  }
  
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: { select: { id: true, name: true, slug: true } },
        sessions: { select: { id: true, lastActivityAt: true } },
        reports: { select: { id: true } },
        aiQueries: { select: { id: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ 
    users: users.map(sanitizeUser),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

export const getUserById = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findFirst({
    where: { id, tenantId: req.tenantId! },
    include: {
      tenant: { select: { id: true, name: true, slug: true } },
      sessions: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  res.json({ user: sanitizeUser(user) });
};

export const createUser = async (req: TenantRequest, res: Response) => {
  const { email, password, firstName, lastName, role } = req.body;
  if (!email || !password) throw new AppError('Email and password are required', 400);

  const exists = await prisma.user.findFirst({ where: { email, tenantId: req.tenantId! } });
  if (exists) throw new AppError('User already exists', 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role: role || 'viewer',
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json({ user: sanitizeUser(user) });
};

export const updateUser = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { password, ...rest } = req.body || {};

  const data: any = { ...rest };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id },
    data,
  });
  if (user.tenantId !== req.tenantId) throw new AppError('Forbidden', 403);
  res.json({ user: sanitizeUser(user) });
};

export const deleteUser = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ message: 'User deleted' });
};

export const changePassword = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword) throw new AppError('New password required', 400);

  const user = await prisma.user.findFirst({ where: { id, tenantId: req.tenantId! } });
  if (!user) throw new AppError('User not found', 404);
  if (currentPassword) {
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new AppError('Current password incorrect', 401);
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  res.json({ message: 'Password updated' });
};
