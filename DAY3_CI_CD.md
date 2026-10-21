# Day 3 CI/CD: Build / Test / Deploy Pipeline

## Repository
`FoodDelivery2` — TasteNow Food Delivery Platform (Node.js, Express, MySQL)

## Pipeline Overview
GitHub Actions CI/CD for Node.js/Express full-stack application.

### Trigger
- Push/Pull Request to `main`
- Manual workflow dispatch

### Stages

#### 1. Lint & Format
- ESLint + Prettier (JavaScript)
- Code style enforcement

#### 2. Test
- Unit tests (Jest/Mocha)
- API integration tests (against test MySQL database)
- End-to-end tests (critical user flows)

#### 3. Build
- `npm ci` (clean install)
- `npm run build` (if build step exists)
- Docker multi-stage build
- Tag images with commit SHA

#### 4. Security Scan
- `npm audit`
- Secret detection (no database credentials, no JWT secrets)
- Dependency vulnerability check

#### 5. Deploy (on merge to `main`)
- Build and push Docker images (backend + frontend clients)
- Deploy with `docker compose up -d` (MySQL + app + clients)
- Run database setup: `node database/setup.js`
- Health check: `GET /api/restaurants`

### Quality Gates
- All tests pass
- Build succeeds
- No secrets committed (no `.env` with credentials)
- Linting clean

### Artifacts
- Docker images (api, client, client-admin, client-customer, client-restaurant)
- Test reports
- Coverage reports
- Deployment URL

## Day 3 Outcome
CI/CD pipeline documented. No code changes. 0 PRs. Ready for Day 4 (project restructuring).
<!-- Feature branch commit for PR -->
