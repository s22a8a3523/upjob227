import { Router } from 'express';
import { query, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import {
  handleFacebookWebhook,
  verifyFacebookWebhook,
  handleLINEWebhook,
  handleTikTokWebhook,
  handleShopeeWebhook,
  getWebhookEvents,
  replayWebhookEvent,
  deleteWebhookEvent
} from '../controllers/webhook.controller';

const router = Router();

// Facebook Webhooks
router.get('/facebook', verifyFacebookWebhook);
router.post('/facebook', handleFacebookWebhook);

// LINE Webhooks
router.post('/line', handleLINEWebhook);

// TikTok Webhooks
router.post('/tiktok', handleTikTokWebhook);

// Shopee Webhooks
router.post('/shopee', handleShopeeWebhook);

// Webhook Management (protected routes would go here)
router.get(
  '/events',
  [
    query('platform').optional().isIn(['facebook', 'line', 'tiktok', 'shopee']).withMessage('Invalid platform'),
    query('type').optional().isString().withMessage('Type must be a string'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
  ],
  validate,
  getWebhookEvents
);

router.post(
  '/events/:id/replay',
  [
    param('id').isString().notEmpty().withMessage('Event ID is required')
  ],
  validate,
  replayWebhookEvent
);

router.delete(
  '/events/:id',
  [
    param('id').isString().notEmpty().withMessage('Event ID is required')
  ],
  validate,
  deleteWebhookEvent
);

export default router;
