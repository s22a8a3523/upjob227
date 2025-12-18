import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as alertController from '../controllers/alert.controller';
import { requireRole } from '../middleware/tenant.middleware';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(alertController.getAlerts));

router.get(
  '/:id',
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(alertController.getAlertById)
);

router.post(
  '/',
  requireRole(['admin','manager']),
  body('name').isString().notEmpty(),
  body('alertType').isString().notEmpty(),
  body('metric').isString().notEmpty(),
  body('operator').isString().notEmpty(),
  body('threshold').optional().isNumeric(),
  body('recipients').optional(),
  body('notificationChannels').optional(),
  validate,
  asyncHandler(alertController.createAlert)
);

router.put(
  '/:id',
  requireRole(['admin','manager']),
  param('id').isString().notEmpty(),
  body('name').optional().isString(),
  body('alertType').optional().isString(),
  body('metric').optional().isString(),
  body('operator').optional().isString(),
  body('threshold').optional().isNumeric(),
  body('isActive').optional().isBoolean(),
  validate,
  asyncHandler(alertController.updateAlert)
);

router.delete(
  '/:id',
  requireRole(['admin','manager']),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(alertController.deleteAlert)
);

router.get(
  '/:id/history',
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(alertController.getAlertHistory)
);

export default router;
