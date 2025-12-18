import { Router } from 'express';
import { tiktokAuthController } from '../controllers/tiktok-auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/tiktok', tiktokAuthController.initiateTikTokAuth);
router.get('/tiktok/callback', tiktokAuthController.handleTikTokCallback);
router.post('/tiktok/token', tiktokAuthController.exchangeTikTokToken);

// Protected routes (require authentication)
router.post('/tiktok/refresh', authenticateToken, tiktokAuthController.refreshTikTokToken);
router.delete('/tiktok/revoke', authenticateToken, tiktokAuthController.revokeTikTokAccess);
router.get('/tiktok/videos', authenticateToken, tiktokAuthController.getTikTokVideos);
router.post('/tiktok/analytics', authenticateToken, tiktokAuthController.getTikTokAnalytics);
router.post('/tiktok/upload', authenticateToken, tiktokAuthController.uploadToTikTok);

export default router;
