import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes';
import googleAuthRoutes from './routes/google-auth.routes';
import tiktokAuthRoutes from './routes/tiktok-auth.routes';
import tenantRoutes from './routes/tenant.routes';
import bootstrapRoutes from './routes/bootstrap.routes';
import campaignRoutes from './routes/campaign.routes';
import metricRoutes from './routes/metric.routes';
import alertRoutes from './routes/alert.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';
import integrationRoutes from './routes/integration.routes';
import userRoutes from './routes/user.routes';
import alertHistoryRoutes from './routes/alertHistory.routes';
import historyRoutes from './routes/history.routes';
import dataRoutes from './routes/data.routes';
import webhookRoutes from './routes/webhook.routes';

// Import middleware
import { errorHandler, asyncHandler } from './middleware/error.middleware';
import { authenticate } from './middleware/auth.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import rateLimiter from './middleware/rateLimit.middleware';
import * as aiController from './controllers/ai.controller';

// Import utilities
import { logger } from './utils/logger';
import { prisma } from './utils/prisma';
import { startSyncJob } from './jobs/sync.job';

// Initialize Express app
const app: Express = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configuration
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Rate limiting
app.use(rateLimiter);

// Swagger Documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RGA Dashboard API Documentation',
  }));
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
}

// Health check endpoints
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'connected',
      uptime: process.uptime(),
      version: '1.0.0',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      version: '1.0.0',
    });
  }
});

app.get('/health/ready', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
});

app.get('/health/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive' });
});

// API Info endpoint
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    name: 'RGA Dashboard API',
    version: '1.0.0',
    status: 'operational',
    baseUrl: `${API_PREFIX}`,
    documentation: '/api-docs',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      tenants: `${API_PREFIX}/tenants`,
      campaigns: `${API_PREFIX}/campaigns`,
      metrics: `${API_PREFIX}/metrics`,
      alerts: `${API_PREFIX}/alerts`,
      reports: `${API_PREFIX}/reports`,
      integrations: `${API_PREFIX}/integrations`,
      webhooks: `${API_PREFIX}/webhooks`,
    },
    timestamp: new Date().toISOString(),
  });
});

// API v1 root endpoint
app.get(`${API_PREFIX}`, (_req: Request, res: Response) => {
  res.json({
    message: 'RGA Dashboard API v1',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api-docs',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      tenants: `${API_PREFIX}/tenants`,
      campaigns: `${API_PREFIX}/campaigns`,
      metrics: `${API_PREFIX}/metrics`,
      alerts: `${API_PREFIX}/alerts`,
      reports: `${API_PREFIX}/reports`,
      integrations: `${API_PREFIX}/integrations`,
      webhooks: `${API_PREFIX}/webhooks`,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
// Bootstrap endpoint (no authentication required, only works when no tenants exist)
app.use(`${API_PREFIX}/bootstrap`, bootstrapRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/auth`, googleAuthRoutes);
app.use(`${API_PREFIX}/auth`, tiktokAuthRoutes);
app.use(`${API_PREFIX}/tenants`, tenantMiddleware, tenantRoutes);
app.use(`${API_PREFIX}/campaigns`, tenantMiddleware, campaignRoutes);
app.use(`${API_PREFIX}/metrics`, tenantMiddleware, metricRoutes);
app.use(`${API_PREFIX}/alerts`, tenantMiddleware, alertRoutes);
app.use(`${API_PREFIX}/reports`, tenantMiddleware, reportRoutes);
app.post(
  `${API_PREFIX}/ai/chat`,
  (req: Request, _res: Response, next) => {
    logger.info('AI chat request received', {
      method: req.method,
      originalUrl: req.originalUrl,
      hasTenantHeader: typeof req.headers['x-tenant-id'] === 'string' && !!(req.headers['x-tenant-id'] as string).trim(),
      hasAuthHeader: typeof req.headers.authorization === 'string' && req.headers.authorization.startsWith('Bearer '),
      contentType: req.headers['content-type'],
    });
    next();
  },
  tenantMiddleware,
  authenticate,
  asyncHandler(aiController.chatWithN8n)
);
logger.info(`📝 Registered /ai/chat endpoint`);
app.use(`${API_PREFIX}/ai`, tenantMiddleware, aiRoutes);
app.use(`${API_PREFIX}/integrations`, tenantMiddleware, integrationRoutes);
app.use(`${API_PREFIX}/users`, tenantMiddleware, userRoutes);
app.use(`${API_PREFIX}/alert-history`, tenantMiddleware, alertHistoryRoutes);
app.use(`${API_PREFIX}/history`, tenantMiddleware, historyRoutes);
app.use(`${API_PREFIX}/data`, tenantMiddleware, dataRoutes);
app.use(`${API_PREFIX}/webhooks`, webhookRoutes); // Webhooks don't need tenant middleware for public endpoints

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// WebSocket configuration
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Join tenant room
  socket.on('join:tenant', (tenantId: string) => {
    socket.join(`tenant:${tenantId}`);
    logger.info(`Client ${socket.id} joined tenant room: ${tenantId}`);
  });

  // Leave tenant room
  socket.on('leave:tenant', (tenantId: string) => {
    socket.leave(`tenant:${tenantId}`);
    logger.info(`Client ${socket.id} left tenant room: ${tenantId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Export io for use in other modules
export { io };

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close HTTP server
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  // Close database connection
  await prisma.$disconnect();
  logger.info('Database connection closed');

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT}`);
    logger.info(`📡 API available at http://localhost:${PORT}${API_PREFIX}`);
    logger.info(`🤖 AI chat proxy available at http://localhost:${PORT}${API_PREFIX}/ai/chat`);
    const hasChatRoute = (app as any)?._router?.stack?.some((layer: any) => {
      const route = layer?.route;
      return route?.path === `${API_PREFIX}/ai/chat` && route?.methods?.post;
    });
    logger.info(`🔎 Route check POST ${API_PREFIX}/ai/chat: ${hasChatRoute ? 'registered' : 'missing'}`);
    logger.info(`🔌 WebSocket available at ws://localhost:${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
    }
    
    // Start scheduled sync job
    startSyncJob();
  });
}

// Export app for testing
export { app };
export default app;
