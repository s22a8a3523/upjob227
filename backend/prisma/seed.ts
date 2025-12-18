import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'rga-demo' },
    update: {},
    create: {
      name: 'RGA Demo',
      slug: 'rga-demo',
      domain: 'localhost',
    },
  });

  // Create SUPER ADMIN user
  const email = 'superadmin@rga.local';
  const passwordHash = await bcrypt.hash('SuperAdmin@123', 10);
  const superAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email } },
    update: { tenantId: tenant.id, role: 'super_admin' },
    create: {
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      tenantId: tenant.id,
      isActive: true,
      emailVerified: true,
    },
  });

  // Example alert
  // Create an example alert if not exists for this tenant
  const existingAlert = await prisma.alert.findFirst({
    where: { tenantId: tenant.id, name: 'Low CTR', metric: 'ctr', operator: '<' }
  });
  if (!existingAlert) {
    await prisma.alert.create({
      data: {
        tenantId: tenant.id,
        name: 'Low CTR',
        alertType: 'threshold',
        metric: 'ctr',
        operator: '<',
        threshold: new Prisma.Decimal(0.5),
        isActive: true,
        recipients: JSON.parse('["superadmin@rga.local"]'),
        notificationChannels: JSON.parse('["email"]'),
      },
    });
  }

  const uiAssets = [
    {
      name: 'Overview Dashboard',
      category: 'dashboard',
      description: 'High-level analytics cockpit mockup',
      fileName: 'Overview.jpg',
      filePath: '/uxui/Overview.jpg',
      tags: ['overview', 'dashboard', 'analytics'],
    },
    {
      name: 'Checklist Experience',
      category: 'onboarding',
      description: 'Integration checklist layout',
      fileName: 'Checklist.jpg',
      filePath: '/uxui/Checklist.jpg',
      tags: ['checklist', 'integration'],
    },
    {
      name: 'Login Experience',
      category: 'auth',
      description: 'Dark glitter login concept',
      fileName: 'LOGIN.jpg',
      filePath: '/uxui/LOGIN.jpg',
      tags: ['auth', 'login'],
    },
    {
      name: 'Campaign - Google Ads',
      category: 'campaign',
      description: 'Google Ads campaign analytics section',
      fileName: 'Campaign (Google Adds).jpg',
      filePath: '/uxui/Campaign (Google Adds).jpg',
      tags: ['campaign', 'google', 'ads'],
    },
    {
      name: 'Campaign - Facebook Ads',
      category: 'campaign',
      description: 'Facebook Ads campaign analytics section',
      fileName: 'Campaign (Facebook Adds).jpg',
      filePath: '/uxui/Campaign (Facebook Adds).jpg',
      tags: ['campaign', 'facebook', 'ads'],
    },
    {
      name: 'Campaign - LINE Ads',
      category: 'campaign',
      description: 'LINE Ads campaign analytics section',
      fileName: 'Campaign (Line Adds).jpg',
      filePath: '/uxui/Campaign (Line Adds).jpg',
      tags: ['campaign', 'line', 'ads'],
    },
    {
      name: 'Campaign - TikTok Ads',
      category: 'campaign',
      description: 'TikTok Ads campaign analytics section',
      fileName: 'Campaign (TIKTOK Adds).jpg',
      filePath: '/uxui/Campaign (TIKTOK Adds).jpg',
      tags: ['campaign', 'tiktok', 'ads'],
    },
    {
      name: 'CRM & Leads',
      category: 'crm',
      description: 'CRM pipeline and leads tracking UI',
      fileName: 'CRM & Leads.jpg',
      filePath: '/uxui/CRM & Leads.jpg',
      tags: ['crm', 'leads'],
    },
    {
      name: 'E-commerce Overview',
      category: 'commerce',
      description: 'E-commerce metrics snapshot',
      fileName: 'E-commerce.jpg',
      filePath: '/uxui/E-commerce.jpg',
      tags: ['commerce', 'orders'],
    },
    {
      name: 'SEO & Web Analytics',
      category: 'seo',
      description: 'SEO visibility and traffic cards',
      fileName: 'SEO & Web Analytics.jpg',
      filePath: '/uxui/SEO & Web Analytics.jpg',
      tags: ['seo', 'web'],
    },
    {
      name: 'Trend Analysis',
      category: 'insight',
      description: 'Trends and anomalies visualization',
      fileName: 'Trend Analysis.jpg',
      filePath: '/uxui/Trend Analysis.jpg',
      tags: ['trend', 'analysis'],
    },
    {
      name: 'Reporting Center',
      category: 'report',
      description: 'Reports library concept',
      fileName: 'Report.jpg',
      filePath: '/uxui/Report.jpg',
      tags: ['report', 'export'],
    },
    {
      name: 'Settings & Profile',
      category: 'settings',
      description: 'Settings management UI',
      fileName: 'Setting.jpg',
      filePath: '/uxui/Setting.jpg',
      tags: ['settings', 'profile'],
    },
  ];

  await Promise.all(
    uiAssets.map((asset) =>
      prisma.uiAsset.upsert({
        where: {
          tenantId_fileName: {
            tenantId: tenant.id,
            fileName: asset.fileName,
          },
        },
        update: {
          name: asset.name,
          category: asset.category,
          description: asset.description,
          filePath: asset.filePath,
          tags: asset.tags,
        },
        create: {
          tenantId: tenant.id,
          ...asset,
        },
      })
    )
  );

  console.log('Seed complete:', { tenant: tenant.slug, superAdmin: superAdmin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
