import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.middleware';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export const getCampaigns = async (req: TenantRequest, res: Response) => {
  const { platform, status, page = 1, limit = 20 } = req.query;
  
  const campaigns = await prisma.campaign.findMany({
    where: {
      tenantId: req.tenantId!,
      ...(platform && { platform: platform as string }),
      ...(status && { status: status as string }),
    },
    include: {
      integration: {
        select: { name: true, type: true },
      },
      metrics: {
        orderBy: { date: 'desc' },
        take: 7,
        select: {
          id: true,
          date: true,
          impressions: true,
          clicks: true,
          conversions: true,
          spend: true,
          revenue: true,
          orders: true,
        },
      },
    },
    skip: (Number(page) - 1) * Number(limit),
    take: Number(limit),
    orderBy: { createdAt: 'desc' },
  });

  const total = await prisma.campaign.count({
    where: { tenantId: req.tenantId! },
  });

  res.json({ campaigns, total, page: Number(page), limit: Number(limit) });
};

export const getCampaignById = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      tenantId: req.tenantId!,
    },
    include: {
      integration: true,
      metrics: {
        orderBy: { date: 'desc' },
        take: 30,
      },
    },
  });

  if (!campaign) {
    throw new AppError('Campaign not found', 404);
  }

  res.json({ campaign });
};

export const createCampaign = async (req: TenantRequest, res: Response) => {
  const campaign = await prisma.campaign.create({
    data: {
      ...req.body,
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json({ campaign });
};

export const updateCampaign = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.updateMany({
    where: {
      id,
      tenantId: req.tenantId!,
    },
    data: req.body,
  });

  res.json({ campaign });
};

export const deleteCampaign = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  await prisma.campaign.deleteMany({
    where: {
      id,
      tenantId: req.tenantId!,
    },
  });

  res.json({ message: 'Campaign deleted successfully' });
};

export const getCampaignMetrics = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  const metrics = await prisma.metric.findMany({
    where: {
      campaignId: id,
      tenantId: req.tenantId!,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        },
      }),
    },
    orderBy: { date: 'asc' },
  });

  res.json({ metrics });
};

export const getCampaignPerformance = async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  // Aggregate metrics
  const performance = await prisma.metric.aggregate({
    where: {
      campaignId: id,
      tenantId: req.tenantId!,
    },
    _sum: {
      impressions: true,
      clicks: true,
      conversions: true,
      spend: true,
      revenue: true,
    },
    _avg: {
      ctr: true,
      conversionRate: true,
      roas: true,
    },
  });

  res.json({ performance });
};
