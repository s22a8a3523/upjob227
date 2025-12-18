import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import * as history from '../controllers/history.controller';
import { requirePermission } from '../middleware/tenant.middleware';
import { PERMISSIONS } from '../constants/rbac';
import { query } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

const filters = [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('userId').optional().isString(),
  query('action').optional().isString(),
  query('entityType').optional().isString(),
  validate,
];

// System history (super_admin only via permission)
router.get('/system', requirePermission(PERMISSIONS.view_system_history), filters, asyncHandler(history.getSystemHistory));

// Admin activity history
router.get('/admin', filters, asyncHandler(history.getAdminHistory));

// Users activity history (by tenant unless super_admin)
router.get('/users', filters, asyncHandler(history.getUsersHistory));

// Personal history
router.get('/me', filters, asyncHandler(history.getMyHistory));

// Export logs (CSV)
router.get('/export', requirePermission(PERMISSIONS.export_logs), filters, asyncHandler(history.exportHistory));

export default router;
