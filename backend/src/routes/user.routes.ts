import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { requireRole, selfOrRoles } from '../middleware/tenant.middleware';
import * as userController from '../controllers/user.controller';
import { body, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireRole(['super_admin', 'admin', 'manager']), asyncHandler(userController.listUsers));

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User information
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  param('id').isString().notEmpty(),
  validate,
  selfOrRoles('id', ['admin', 'manager']),
  asyncHandler(userController.getUserById)
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [super_admin, admin_full, admin_user, manager, viewer]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post(
  '/',
  requireRole(['admin', 'manager']),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('role').optional().isString().isIn(['super_admin','admin_full','admin_user','manager','viewer']),
  validate,
  asyncHandler(userController.createUser)
);

router.put(
  '/:id',
  requireRole(['admin', 'manager']),
  param('id').isString().notEmpty(),
  body('email').optional().isEmail(),
  body('password').optional().isString().isLength({ min: 8 }),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
  body('role').optional().isString().isIn(['admin','manager','viewer']),
  validate,
  asyncHandler(userController.updateUser)
);

router.delete(
  '/:id',
  requireRole(['admin']),
  param('id').isString().notEmpty(),
  validate,
  asyncHandler(userController.deleteUser)
);

router.post(
  '/:id/change-password',
  selfOrRoles('id', ['admin']),
  param('id').isString().notEmpty(),
  body('currentPassword').optional().isString().isLength({ min: 8 }),
  body('newPassword').isString().isLength({ min: 8 }),
  validate,
  asyncHandler(userController.changePassword)
);

export default router;
