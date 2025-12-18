# RGA Dashboard - Complete Setup Guide

## ✅ Completed Features

### 1. Testing Setup
- ✅ Jest configuration
- ✅ Test setup file
- ✅ Sample auth tests
- Run tests: `npm test`

### 2. API Documentation
- ✅ Swagger/OpenAPI setup
- ✅ Auto-generated documentation
- Access at: `http://localhost:3001/api-docs`

### 3. Pagination, Search & Filtering
- ✅ User list with pagination, search, and filters
- ✅ Campaign list with pagination
- ✅ All endpoints support query parameters

### 4. Integrations
- ✅ Google Ads API sync implementation
- ✅ Shopee API sync implementation
- ✅ Lazada API sync implementation
- ✅ Facebook sync (existing)
- ✅ GA4 sync (existing)

### 5. Report Generation
- ✅ PDF report generation
- ✅ Excel report generation
- ✅ CSV report generation
- ✅ Report aggregation and summary

### 6. Authentication
- ✅ JWT token authentication
- ✅ Refresh token mechanism
- ✅ Password reset flow
- ✅ Token expiration handling

### 7. Health Checks
- ✅ `/health` - Full health check with database
- ✅ `/health/ready` - Readiness probe
- ✅ `/health/live` - Liveness probe

### 8. Auto-Sync Jobs
- ✅ Scheduled sync job (runs every hour)
- ✅ Automatic integration syncing
- ✅ Error handling and logging

## 🚀 Quick Start

### 1. Database Setup
```bash
# Run the SQL script in pgAdmin4
# File: database/setup_rga_dashboard.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL
npm run dev
```

### 3. Bootstrap System
```bash
# PowerShell
.\scripts\setup.js
# Or use the API directly
```

### 4. Test API
```bash
# PowerShell
.\test-api.ps1
.\complete-test.ps1
```

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password

### Bootstrap
- `GET /api/v1/bootstrap/status` - Check bootstrap status
- `POST /api/v1/bootstrap` - Create first tenant and admin

### Integrations
- `GET /api/v1/integrations` - List integrations
- `POST /api/v1/integrations` - Create integration
- `POST /api/v1/integrations/:id/sync` - Sync integration
- `POST /api/v1/integrations/:id/test` - Test integration

### Reports
- `GET /api/v1/reports` - List reports
- `POST /api/v1/reports` - Create report
- `POST /api/v1/reports/:id/generate` - Generate report
- `GET /api/v1/reports/:id/download?format=pdf|excel|csv` - Download report

### Health Checks
- `GET /health` - Full health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/rga_dashboard

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

## 📝 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

## 🔄 Auto-Sync

The system automatically syncs integrations every hour. To manually trigger:
```bash
POST /api/v1/integrations/:id/sync
```

## 📊 Report Formats

Reports can be generated in three formats:
- **PDF**: `GET /api/v1/reports/:id/download?format=pdf`
- **Excel**: `GET /api/v1/reports/:id/download?format=excel`
- **CSV**: `GET /api/v1/reports/:id/download?format=csv`

## 🛠️ Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

### Database
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio

## 📖 Documentation

- API Documentation: `http://localhost:3001/api-docs`
- Swagger JSON: `http://localhost:3001/api-docs.json`

## ✅ Production Checklist

- [ ] Set secure `JWT_SECRET`
- [ ] Configure production database
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Test all integrations
- [ ] Load testing
- [ ] Security audit

## 🎯 Next Steps

1. Set up production environment
2. Configure integrations with real credentials
3. Set up monitoring (e.g., Sentry, DataDog)
4. Configure email service for password reset
5. Set up CI/CD pipeline
6. Load testing
7. Security audit

## 📞 Support

For issues or questions, please contact the development team.

