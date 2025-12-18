import { Router } from 'express';
import { asyncHandler } from '../middleware/error.middleware';
import { authenticate } from '../middleware/auth.middleware';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(reportController.getReports));
router.get('/:id', asyncHandler(reportController.getReportById));
router.post('/', asyncHandler(reportController.createReport));
router.put('/:id', asyncHandler(reportController.updateReport));
router.delete('/:id', asyncHandler(reportController.deleteReport));
router.post('/:id/generate', asyncHandler(reportController.generateReport));
router.get('/:id/download', asyncHandler(reportController.downloadReport));

export default router;
