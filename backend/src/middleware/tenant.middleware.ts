import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { getRolePermissions, type Permission } from '../constants/rbac';

export interface TenantRequest extends Request {
  tenantId?: string;
  userId?: string;
  userRole?: string;
}

export const tenantMiddleware = (req: TenantRequest, res: Response, next: NextFunction) => {
  // Get tenant ID from header or JWT payload
  const tenantId = req.headers['x-tenant-id'] as string || req.body?.tenantId;

  if (!tenantId) {
    return next(new AppError('Tenant ID is required', 400));
  }

  // Add tenant ID to request
  req.tenantId = tenantId;

  next();
};

export const requireRole = (roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};

export const selfOrRoles = (paramKey: string, roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    const targetId = req.params?.[paramKey];
    if (targetId && req.userId === targetId) return next();
    if (req.userRole && roles.includes(req.userRole)) return next();
    return next(new AppError('Insufficient permissions', 403));
  };
};

export const requireAnyRole = (roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (req.userRole && roles.includes(req.userRole)) return next();
    return next(new AppError('Insufficient permissions', 403));
  };
};

export const requirePermission = (perm: Permission) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    const perms = getRolePermissions(req.userRole);
    if (perms.includes(perm)) return next();
    return next(new AppError('Insufficient permissions', 403));
  };
};
