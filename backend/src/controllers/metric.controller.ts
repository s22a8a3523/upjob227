import { Response } from 'express';
import { TenantRequest } from '../middleware/tenant.middleware';
import { prisma } from '../utils/prisma';

export const getOverview = async (req: TenantRequest, res: Response) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayMetrics = await prisma.metric.aggregate({
    where: {
      tenantId: req.tenantId!,
      date: { gte: today },
    },
    _sum: {
      impressions: true,
      clicks: true,
      conversions: true,
      spend: true,
      revenue: true,
    },
  });

  res.json({ overview: todayMetrics });
};

export const getDashboardData = async (req: TenantRequest, res: Response) => {
  const { period = '7d' } = req.query;
  
  // Calculate date range based on period
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  const metrics = await prisma.metric.findMany({
    where: {
      tenantId: req.tenantId!,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: 'asc' },
  });

  // Group by date
  const groupedMetrics = metrics.reduce((acc: any, metric: any) => {
    const dateKey = metric.date.toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: dateKey,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        revenue: 0,
      };
    }
    acc[dateKey].impressions += metric.impressions || 0;
    acc[dateKey].clicks += metric.clicks || 0;
    acc[dateKey].conversions += metric.conversions || 0;
    acc[dateKey].spend += Number(metric.spend) || 0;
    acc[dateKey].revenue += Number(metric.revenue) || 0;
    return acc;
  }, {});

  res.json({ data: Object.values(groupedMetrics) });
};

export const getTrends = async (req: TenantRequest, res: Response) => {
  res.json({ message: 'Get trends - Coming soon' });
};

export const getComparison = async (req: TenantRequest, res: Response) => {
  res.json({ message: 'Get comparison - Coming soon' });
};

export const bulkCreateMetrics = async (req: TenantRequest, res: Response) => {
  const { metrics } = req.body;

  const created = await prisma.metric.createMany({
    data: metrics.map((m: any) => ({
      ...m,
      tenantId: req.tenantId!,
    })),
    skipDuplicates: true,
  });

  res.status(201).json({ created });
};
