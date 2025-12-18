import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as metricController from '../controllers/metric.controller';

const router = Router();

router.use(authenticate);

// Metrics
router.get('/overview', asyncHandler(metricController.getOverview));
router.get('/dashboard', asyncHandler(metricController.getDashboardData));
router.get('/trends', asyncHandler(metricController.getTrends));
router.get('/comparison', asyncHandler(metricController.getComparison));
router.post('/bulk', asyncHandler(metricController.bulkCreateMetrics));

export default router;
