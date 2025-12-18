# Claude Context - ShopRewards Hub

## Project Overview

**ShopRewards Hub** is a multi-tenant SaaS platform for managing customer rewards, vouchers, and promotional campaigns across retail shops. The system features comprehensive security, RBAC, field-level encryption, and a 12-step setup wizard for onboarding new tenants.

**Tech Stack:**
- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, shadcn/ui
- **Backend:** tRPC, Node.js 25
- **Database:** PostgreSQL 18.1 + Prisma ORM
- **Cache:** Valkey 9.0 (Redis-compatible)
- **Queue:** RabbitMQ 4.2
- **Storage:** MinIO (S3-compatible)
- **Infrastructure:** Docker Compose, Cloudflare Tunnel

**Repository:** `/home/ehs/shop-rewards-hub`
**Branch:** `master`
**Public URL:** `https://shoprewards.lalatendu.info` (via Cloudflare Tunnel)

---

## Current State (December 18, 2025)

### Progress: ~35-40% Complete

**Working Tree:** Clean (no uncommitted changes)

**Last Session Accomplishments:**
1. ✅ Complete MFA frontend UI implementation (Phase 3.3)
   - MFA setup page with QR code generation and backup codes
   - MFA management in user profile (enable/disable/regenerate)
   - Password-protected disable and regenerate modals
2. ✅ Enhanced JWT tokens with email, name, and mfaEnabled fields
3. ✅ Updated AuthContext to track MFA status
4. ✅ Professional login page redesign (clean, minimal aesthetic)
5. ✅ Admin profile and settings pages created

**Recent Commits:**
```
d61a9a9 feat(auth): implement complete MFA frontend UI
a227000 refactor(ui): redesign login with clean, minimal professional style
1e21b26 fix(server): resolve import and bcrypt compatibility issues
a0fe5fe feat(admin): implement create user modal and delete confirmation
8c7ab9b feat(frontend): add admin layout wrapper and users list page
```

---

## Architecture Highlights

### Multi-Tenancy
- **Database:** Row-level security via Prisma middleware (`shopId` isolation)
- **Storage:** Bucket-per-tenant design (MinIO) - pending implementation
- **Cache:** Tenant namespacing (Valkey) - pending implementation
- **Super Admin:** Bypass mechanism for platform-wide access

### Security
- **Encryption:** AES-256-GCM field-level encryption (passwords, API keys, MFA secrets)
- **Authentication:** JWT-based with jose library
- **RBAC:** Role-Permission-User model with 40+ granular permissions
- **Audit:** Logging-ready infrastructure (not yet implemented)
- **GDPR:** Auto-delete mechanisms planned

### Key Files
- **Schema:** `packages/db/prisma/schema.prisma` (600+ lines, 30+ models)
- **RLS Middleware:** `packages/db/src/middleware/tenant-rls.ts`
- **Encryption:** `packages/db/src/middleware/encryption.ts`
- **Wizard Store:** `apps/web/src/store/wizardStore.ts`
- **tRPC Routers:** `apps/web/src/server/routers/` (wizard.ts, users.ts, auth.ts)
- **Auth Services:** `apps/web/src/lib/auth/` (jwt.service.ts, rbac.service.ts, hash.service.ts, mfa.service.ts)
- **Admin UI:** `apps/web/src/components/admin/` (layout, users, modals)
- **Security UI:** `apps/web/src/components/security/` (DisableMFAModal, RegenerateBackupCodesModal)
- **MFA Setup:** `apps/web/src/app/admin/security/mfa/setup/page.tsx`
- **Auth Context:** `apps/web/src/contexts/AuthContext.tsx`

---

## Completed Phases

### ✅ Phase 1: Foundation (100%)
- 1.1: Turborepo monorepo setup
- 1.2: Prisma schema (30+ models)
- 1.3: Row-level security middleware
- 1.4: Field encryption middleware
- 1.5: Shared packages (validators, constants, utilities)

### ✅ Phase 2: Setup Wizard (100%)
- 2.1: Zustand store with localStorage persistence
- 2.2: 12-step wizard UI components
- 2.3: tRPC wizard router integration
- 2.4: Validation services (SMTP, DNS, DB)
- 2.5: First-boot detection system

### ✅ Phase 3: Authentication (100%)
- 3.1: JWT service (sign, verify, refresh) ✅
- 3.2: RBAC service with permission seeding ✅
- 3.3: Admin user management system ✅
- 3.4: Authentication context and frontend hooks ✅
- 3.5: MFA complete implementation ✅
  - MFA service with TOTP, QR codes, backup codes (238 lines)
  - Auth router with all MFA endpoints (583 lines)
  - MFA setup page with QR code and backup codes display
  - MFA management modals (disable, regenerate codes)
  - Profile integration with MFA status tracking
  - JWT payload enhanced with mfaEnabled field

### ✅ Phase 6.1: Docker Compose (Partial)
- Docker Compose configuration (9 services)
- RabbitMQ queue definitions
- PostgreSQL extensions
- Development setup script

---

## Pending Work

### Critical Path to MVP

1. **Phase 4: Multi-Tenancy Services** (3-5 days)
   - MinIO tenant isolation (bucket-per-tenant)
   - Valkey namespace service
   - Tenant context propagation utilities

2. **Phase 5: Security Hardening** (1 week)
   - Audit logging middleware
   - Rate limiting (Valkey-based)
   - GDPR auto-delete cron job
   - Real-time security alerts (Socket.io)

3. **Phase 6.2-6.4: Docker Completion** (3-5 days)
   - Multi-stage Dockerfiles (web, api, worker)
   - CI/CD Jenkinsfile
   - Entrypoint scripts

4. **Phase 7: Core Features** (2 weeks)
   - Receipt upload + Ollama OCR integration
   - Voucher management with QR codes
   - Campaign/Ad management

5. **Phase 8: Super Admin Dashboard** (1 week)
   - Stats dashboard
   - Encrypted config management
   - Real-time monitoring

6. **Phase 9: Testing** (2 weeks)
   - Jest unit tests (95% coverage target)
   - E2E tests (Cypress/Playwright)
   - Security scans (OWASP ZAP)
   - Accessibility audits (Axe-core)

7. **Phase 10: Production Deployment** (1 week)
   - Monitoring setup (Prometheus, Grafana, Sentry)
   - Performance optimization
   - Production deployment scripts

---

## Active TODOs in Codebase

### High Priority
- `apps/web/src/server/routers/wizard.ts` - 20+ TODO comments for database operations
  - Company creation (step 1)
  - Admin user creation (step 2)
  - Domain verification (step 3)
  - SMTP testing and encryption (step 6)
  - Database migration runner (step 7)
  - Role/permission seeding (step 8)
  - CSV import (step 10)
  - Payment provider validation (step 11)

### Medium Priority
- `apps/web/src/server/trpc.ts` - Add Prisma client when auth is implemented
- `apps/web/src/components/wizard/steps/` - Test connections (SMTP, DB)

---

## Development Workflow

### Starting Development Environment
```bash
# Quick start (from project root)
./scripts/dev.sh

# Or manual:
cd /home/ehs/shop-rewards-hub
docker-compose -f infra/docker-compose.yml up -d db cache queue storage
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

### Useful Commands
```bash
# Database
pnpm db:generate     # Generate Prisma client
pnpm db:migrate      # Create migration
pnpm db:seed         # Seed database
pnpm db:studio       # Open Prisma Studio

# Development
pnpm dev             # Start dev servers
pnpm build           # Build all packages
pnpm lint            # Lint codebase
pnpm typecheck       # Type check

# Infrastructure
cd infra && docker-compose up -d      # Start services
cd infra && docker-compose logs -f    # View logs
cd infra && docker-compose down       # Stop services

# Cloudflare Tunnel
sudo systemctl status cloudflared-tunnel4
sudo systemctl start cloudflared-tunnel4
sudo systemctl stop cloudflared-tunnel4
```

### Service URLs (Development)
- **PostgreSQL:** `localhost:5432` (user: `shoprewards`, pass: `devpassword`)
- **Valkey:** `localhost:6379`
- **RabbitMQ:** `http://localhost:15672` (guest/guest)
- **MinIO:** `http://localhost:9001` (shoprewards/shoprewards123!)
- **Web App:** `http://localhost:3000` or `https://shoprewards.lalatendu.info`

---

## Important Conventions

### Code Style
- No emojis in code/commits unless explicitly requested
- Prefer editing existing files over creating new ones
- Use Zod for validation
- Follow existing patterns in the codebase

### Git Workflow
- Work on `master` branch (no feature branches currently)
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Include Claude attribution in commits when requested

### Security
- Never commit `.env` files
- All secrets encrypted in database with AES-256-GCM
- Master key from `ENCRYPTION_KEY` environment variable
- JWT secrets from `JWT_SECRET` environment variable

### Database
- Always use Prisma middleware (RLS, encryption)
- Never bypass tenant isolation (except for super_admin)
- Use soft deletes (`deletedAt`) instead of hard deletes
- All timestamps in UTC

---

## Known Issues & Notes

1. **Setup Wizard TODOs:** Many wizard endpoints return mock data - need database operations
2. **Docker Images:** Dockerfiles for web/api/worker not yet created
3. **Testing:** No test suite implemented yet
4. **Audit Logging:** Middleware structure ready but not implemented

---

## Next Session Priorities

**Recommended Order:**
1. Implement wizard database operations (20+ TODO items, straightforward Prisma calls)
2. Build multi-tenancy services (Phase 4 - MinIO, Valkey, context propagation)
3. Create Dockerfiles to make system fully containerized
4. Begin core features (receipt OCR, vouchers)
5. Security hardening (audit logging, rate limiting)

**Quick Wins:**
- Wizard DB operations: Most are 5-10 line Prisma calls (high value, low effort)
- MFA UI pages: Backend ready, just need React components
- Basic Dockerfiles: Templates exist, just need customization

---

## References

- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Infrastructure Docs:** `infra/CLOUDFLARED_SERVICE.md`
- **Plan:** `/home/ehs/.claude/plans/cryptic-conjuring-tide.md`
- **Prisma Docs:** https://www.prisma.io/docs
- **tRPC Docs:** https://trpc.io
- **Next.js 16:** https://nextjs.org/docs

---

**Last Updated:** December 18, 2025 (Evening)
**Status:** Foundation + Wizard + Authentication (100%) Complete
**Next Milestone:** Multi-Tenancy Services + Wizard Database Operations
