import request from 'supertest';
import app from '../server';
import { prisma } from '../utils/prisma';

describe('Auth API', () => {
  let testToken: string;
  let testTenantId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@' } },
    });
    await prisma.tenant.deleteMany({
      where: { slug: 'test-tenant' },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { email: { contains: 'test@' } },
    });
    await prisma.tenant.deleteMany({
      where: { slug: 'test-tenant' },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      // First create a tenant
      const tenant = await prisma.tenant.create({
        data: {
          name: 'Test Tenant',
          slug: 'test-tenant',
        },
      });
      testTenantId = tenant.id;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          tenantId: testTenantId,
          firstName: 'Test',
          lastName: 'User',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
      testToken = response.body.token;
      testUserId = response.body.user.id;
    });

    it('should not register duplicate email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword',
          tenantId: testTenantId,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${testToken}`)
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('x-tenant-id', testTenantId);

      expect(response.status).toBe(401);
    });
  });
});
