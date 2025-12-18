# ShopRewards Hub

A production-ready multi-tenant SaaS rewards platform with zero hardcoded secrets, comprehensive security (RBAC, RLS, encryption), and a 12-step first-time setup wizard.

## Features

- **Multi-tenant architecture**: Shops as tenants with complete data isolation
- **Zero hardcoded secrets**: All configs encrypted in database
- **12-step setup wizard**: Interactive onboarding with database target selection
- **Type-safe full-stack**: Next.js 16 + tRPC + Prisma
- **Enterprise security**: RBAC, RLS, JWT + MFA, audit logging
- **GDPR compliant**: Auto-delete after 30 days, data export, right to deletion
- **Docker-first**: All services containerized with docker-compose
- **CI/CD ready**: Jenkins pipeline included

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js 25.2.1, tRPC, Express
- **Database**: PostgreSQL 18.1 with Prisma ORM
- **Cache**: Valkey 9.0.0
- **Queue**: RabbitMQ 4.2.1
- **Storage**: MinIO 2.0.4
- **Proxy**: Nginx with Let's Encrypt
- **CI/CD**: Jenkins
- **AI**: Ollama (optional OCR)

## Quick Start

### Prerequisites

- Node.js >=20.0.0
- pnpm >=8.0.0
- Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone <repository-url>
cd shop-rewards-hub

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Start development environment
pnpm docker:dev
```

### First-Time Setup

1. Start all services: `docker-compose up -d`
2. Access the wizard: `http://localhost:3000/setup`
3. Complete all 12 steps:
   - Company information
   - Admin user creation
   - Domain & branding
   - App configuration
   - Security policies
   - Integration setup (SMTP, storage, etc.)
   - **Database target** (SQLite/Docker Postgres/Managed Cloud)
   - Roles & permissions
   - Departments & locations
   - Data import (CSV)
   - Billing configuration
   - Review & launch

4. Login with your admin credentials

## Project Structure

```
shop-rewards-hub/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Node.js + tRPC backend
├── packages/
│   ├── ui/           # Shared shadcn/ui components
│   ├── db/           # Prisma schema + middleware
│   ├── shared/       # Zod validators, types, utils
│   └── config/       # ESLint, TypeScript, Tailwind configs
├── docker/           # Dockerfiles and scripts
├── infra/            # docker-compose configs
├── scripts/          # Build and deployment scripts
└── tests/            # E2E tests
```

## Development

```bash
# Start dev servers (hot reload)
pnpm dev

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Format code
pnpm format
```

## Database Management

```bash
# Generate Prisma client
pnpm db:generate

# Create migration
pnpm db:migrate

# Apply migrations (production)
pnpm db:migrate:deploy

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Docker Commands

```bash
# Start all services
pnpm docker:dev

# Build images
pnpm docker:build

# Production deployment
pnpm docker:prod

# Stop services
pnpm docker:down

# View logs
pnpm docker:logs
```

## Environment Variables

Create `.env` file (or configure via setup wizard):

```env
# Master encryption key (32-byte hex)
ENCRYPTION_KEY=<openssl rand -hex 32>

# JWT secret
JWT_SECRET=<random-string>

# Database
DATABASE_URL=postgresql://user:pass@db:5432/shoprewards

# Services
VALKEY_URL=redis://cache:6379
RABBITMQ_URL=amqp://user:pass@queue:5672
MINIO_ENDPOINT=storage
MINIO_ACCESS_KEY=shoprewards
MINIO_SECRET_KEY=<random>

# Ollama (optional)
OLLAMA_URL=http://ollama:11434

# Setup wizard
SETUP_COMPLETED=false
```

## Architecture

### Multi-Tenancy

- **Database**: Row-level security via Prisma middleware (auto-inject `shopId`)
- **Storage**: MinIO bucket-per-tenant (`tenant-{shopId}-receipts`)
- **Cache**: Valkey namespacing (`tenant:{shopId}:{key}`)

### Security

- **Authentication**: JWT (15 min) + refresh tokens (7 days) + MFA (TOTP)
- **Authorization**: RBAC with 40+ permissions across 3 roles
- **Encryption**: AES-256-GCM for secrets, bcrypt for passwords
- **Audit**: All mutations logged with before/after JSON
- **Rate limiting**: Valkey-based (100 req/min per user)

### GDPR Compliance

- Auto-delete receipts after 30 days (configurable)
- Data export API (JSON dump)
- Right to deletion (anonymize audit logs)
- Consent tracking (analytics, marketing)

## Testing

- **Unit tests**: Jest with 95% coverage target
- **E2E tests**: Cypress/Playwright for critical flows
- **Security tests**: OWASP ZAP scans
- **Accessibility**: Axe-core audits (WCAG 2.2 AA)

## Deployment

### Production Deployment

1. Configure production environment variables
2. Build Docker images: `pnpm docker:build`
3. Deploy: `pnpm docker:prod`
4. Complete setup wizard
5. Configure DNS and SSL (Certbot)

### CI/CD Pipeline (Jenkins)

Pipeline automatically:
- Lints and type checks
- Runs all tests
- Builds Docker images
- Pushes to registry
- Deploys to production
- Runs migrations
- Renews SSL certificates

Trigger: Push to `main` branch or create version tag (`v*.*.*`)

## Monitoring

- **Health checks**: `/health` endpoint checks all services
- **Metrics**: Prometheus + Grafana dashboards
- **Errors**: Sentry error tracking
- **Analytics**: Matomo (privacy-focused)

## Security

### OWASP Top 10 Compliance

- ✅ Broken Access Control: RBAC + RLS
- ✅ Cryptographic Failures: AES-256 + bcrypt
- ✅ Injection: Prisma parameterized queries
- ✅ Insecure Design: Multi-layered security
- ✅ Security Misconfiguration: Least privilege
- ✅ Vulnerable Components: Dependabot + npm audit
- ✅ Authentication Failures: JWT + MFA + rate limiting
- ✅ Software Integrity: File hashing (SHA-256)
- ✅ Logging Failures: Comprehensive audit logging
- ✅ SSRF: IP whitelist + CORS

## Support

For issues and feature requests, please create an issue in the repository.

## License

MIT

---

**Note**: This is a production-ready system designed for 10k+ shops. Follow the deployment guide carefully and complete the security checklist before going live.
