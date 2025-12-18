import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.middleware';
import { prisma } from '../utils/prisma';
import { body, validationResult } from 'express-validator';
import { facebookService } from '../services/facebook.service';
import { googleAdsService } from '../services/googleads.service';
import { lineService } from '../services/line.service';
import { tiktokService } from '../services/tiktok.service';
import { shopeeService } from '../services/shopee.service';
import * as googleAdsSync from '../services/googleAds';
import * as shopeeSync from '../services/shopee';
import * as lazadaSync from '../services/lazada';
import * as facebookSync from '../services/facebook';
import * as ga4Sync from '../services/ga4';

export const getIntegrations = async (req: TenantRequest, res: Response) => {
  try {
    const integrations = await prisma.integration.findMany({
      where: { tenantId: req.tenantId! },
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true,
        // Don't expose credentials
      },
    });

    res.json({ integrations });
  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getIntegrationNotifications = async (req: TenantRequest, res: Response) => {
  try {
    const { status } = req.query;

    const notifications = await prisma.integrationNotification.findMany({
      where: {
        tenantId: req.tenantId!,
        ...(status ? { status: status as string } : {}),
      },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            provider: true,
            lastSyncAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Get integration notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getIntegrationById = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;

    const integration = await prisma.integration.findFirst({
      where: { id, tenantId: req.tenantId! },
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        config: true,
        lastSyncAt: true,
        createdAt: true,
      },
    });

    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    res.json({ integration });
  } catch (error) {
    console.error('Get integration by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createIntegration = async (req: TenantRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provider, config, name } = req.body;

    // Check if integration already exists
    const existingIntegration = await prisma.integration.findFirst({
      where: { tenantId: req.tenantId!, provider }
    });

    if (existingIntegration) {
      return res.status(400).json({ message: 'Integration for this provider already exists' });
    }

    // Validate credentials based on provider
    let isValid = false;
    switch (provider) {
      case 'facebook':
        isValid = await facebookService.validateCredentials(config);
        break;
      case 'googleads':
        isValid = await googleAdsService.validateCredentials(config);
        break;
      case 'line':
        isValid = await lineService.validateCredentials(config);
        break;
      case 'tiktok':
        isValid = await tiktokService.validateCredentials(config);
        break;
      case 'shopee':
        isValid = await shopeeService.validateCredentials(config);
        break;
      default:
        return res.status(400).json({ message: 'Invalid provider' });
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const integration = await prisma.integration.create({
      data: {
        tenantId: req.tenantId!,
        provider,
        config,
        name: name || `${provider} Integration`,
        isActive: true
      }
    });

    res.status(201).json({ integration });
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateIntegration = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  const integration = await prisma.integration.updateMany({
    where: { id, tenantId: req.tenantId! },
    data: req.body,
  });

  res.json({ integration });
};

export const deleteIntegration = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  await prisma.integration.deleteMany({
    where: { id, tenantId: req.tenantId! },
  });

  res.json({ message: 'Integration deleted successfully' });
};

export const syncIntegration = async (req: TenantRequest, res: Response) => {
  try {
    const { id } = req.params;
    const integration = await prisma.integration.findFirst({ 
      where: { id, tenantId: req.tenantId! } 
    });
    
    if (!integration) {
      return res.status(404).json({ message: 'Integration not found' });
    }

    if (!integration.isActive) {
      return res.status(400).json({ message: 'Integration is not active' });
    }

    let result: any;
    switch (integration.provider) {
      case 'google_ads':
        result = await googleAdsSync.sync(integration);
        break;
      case 'facebook':
        result = await facebookSync.sync(integration);
        break;
      case 'ga4':
        result = await ga4Sync.sync(integration);
        break;
      case 'shopee':
        result = await shopeeSync.sync(integration);
        break;
      case 'lazada':
        result = await lazadaSync.sync(integration);
        break;
      default:
        result = { status: 'skipped', reason: 'unknown provider' };
    }

    return res.json({ 
      message: 'Sync completed', 
      provider: integration.provider, 
      result 
    });
  } catch (error: any) {
    console.error('Sync integration error:', error);
    return res.status(500).json({ 
      message: 'Sync failed', 
      error: error.message 
    });
  }
};

export const testIntegration = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const integration = await prisma.integration.findFirst({ where: { id, tenantId: req.tenantId! } });
  if (!integration) return res.status(404).json({ message: 'Integration not found' });

  // Simulated test per provider
  return res.json({ message: 'Integration is configured', provider: integration.type, integrationId: id });
};
