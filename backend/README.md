# RGA Dashboard Backend API

Backend API สำหรับ RGA Dashboard - Real-time Analytics Platform

## 🚀 Features

- RESTful API with Express.js
- PostgreSQL database with Prisma ORM
- JWT Authentication & Authorization
- Multi-tenant architecture
- Integrations: Google Ads, Shopee, Lazada
- Reports: PDF, Excel, CSV export
- Swagger API Documentation
- Auto-sync cron jobs

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## 🔧 Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/rga_dashboard"
# JWT_SECRET="your-secret-key"
```

## 🗄️ Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Or use SQL script
# See database/setup_rga_dashboard.sql
```

## 🏃 Running

```bash
# Development
npm run dev

# Production
npm start

# Build
npm run build
```

## 📡 API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Documentation
- Swagger UI: `http://localhost:3001/api-docs`

### Health Checks
- `/health` - Health check
- `/health/ready` - Readiness check
- `/health/live` - Liveness check

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📚 Documentation

- `API_SETUP_GUIDE.md` - API setup guide
- `QUICK_START.md` - Quick start guide
- `COMPLETE_FEATURES.md` - Features summary
- `FINAL_STATUS.md` - Final status

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- Rate limiting
- Input validation
- CORS configuration
- Helmet.js security headers

## 📊 Features

- ✅ 50+ API endpoints
- ✅ User management (CRUD + Pagination + Search)
- ✅ Campaign management
- ✅ Metrics & Analytics
- ✅ Alerts
- ✅ Integrations sync
- ✅ Reports generation & export
- ✅ Webhooks

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## 📝 License

Copyright © 2025 RGA Analytics Company Limited

