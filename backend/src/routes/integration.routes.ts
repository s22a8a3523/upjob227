import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as integrationController from '../controllers/integration.controller';
import { requirePermission } from '../middleware/tenant.middleware';
import { PERMISSIONS } from '../constants/rbac';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import * as oauthController from '../controllers/oauth.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(integrationController.getIntegrations));
router.get('/notifications', asyncHandler(integrationController.getIntegrationNotifications));
router.get('/:id', asyncHandler(integrationController.getIntegrationById));

router.post(
  '/',
  requirePermission(PERMISSIONS.manage_integrations),
  body('type').isString().notEmpty(),
  body('name').isString().notEmpty(),
  body('credentials').optional(),
  body('config').optional(),
  validate,
  asyncHandler(integrationController.createIntegration)
);

router.put(
  '/:id',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(integrationController.updateIntegration)
);

router.delete(
  '/:id',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(integrationController.deleteIntegration)
);

router.post(
  '/:id/sync',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(integrationController.syncIntegration)
);

router.post(
  '/:id/test',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(integrationController.testIntegration)
);

// OAuth endpoints
router.post(
  '/:id/oauth/start',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(oauthController.startOAuth)
);

router.get(
  '/:id/oauth/callback',
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(oauthController.handleCallback)
);

router.post(
  '/:id/oauth/refresh',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(oauthController.refreshToken)
);

router.get(
  '/:id/oauth/status',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(oauthController.getOAuthStatus)
);

router.post(
  '/:id/oauth/revoke',
  requirePermission(PERMISSIONS.manage_integrations),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(oauthController.revokeAccess)
);

export default router;
