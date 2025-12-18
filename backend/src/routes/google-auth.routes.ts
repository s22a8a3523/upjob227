import { Router } from 'express';
import { googleAuthController } from '../controllers/google-auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/google', googleAuthController.initiateGoogleAuth);
router.get('/google/callback', googleAuthController.handleGoogleCallback);
router.post('/google/token', googleAuthController.exchangeGoogleToken);

// Protected routes (require authentication)
router.post('/google/refresh', authenticateToken, googleAuthController.refreshGoogleToken);
router.delete('/google/revoke', authenticateToken, googleAuthController.revokeGoogleAccess);
router.get('/google/calendar', authenticateToken, googleAuthController.getCalendarEvents);
router.get('/google/drive', authenticateToken, googleAuthController.getDriveFiles);

export default router;
