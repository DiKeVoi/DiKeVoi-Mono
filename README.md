# DiKeVoi Monorepo

[![Test and Analyze](https://github.com/DiKeVoi/DiKeVoi-Mono/actions/workflows/test.yml/badge.svg)](https://github.com/DiKeVoi/DiKeVoi-Mono/actions/workflows/test.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=dikevoi&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=dikevoi)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=dikevoi&metric=coverage)](https://sonarcloud.io/summary/new_code?id=dikevoi)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=dikevoi&metric=bugs)](https://sonarcloud.io/summary/new_code?id=dikevoi)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=dikevoi&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=dikevoi)

Monorepo for DiKeVoi — a mobile ride-sharing platform. Contains a FastAPI backend and an Expo (React Native) frontend.

## Running locally

Install root dependencies first:

```bash
pnpm install
```

Start both frontend and backend concurrently:

```bash
pnpm start
```

---

## Testing

### Backend (Python / pytest)

```bash
cd backend
```

Run tests with coverage:

```bash
pytest
```

Coverage report is written to `backend/coverage.xml` and printed to the terminal. Minimum threshold: **80%**.

View missing lines:

```bash
pytest --cov-report=term-missing
```

---

### Frontend (Expo / Jest)

```bash
cd frontend
```

Run all tests:

```bash
npm test
```

Run tests with coverage report:

```bash
npm run test:coverage
```

HTML coverage report is generated at `frontend/coverage/lcov-report/index.html`.

Run in watch mode (local development only):

```bash
npx jest-expo --watch
```

---

## CI / CD

GitHub Actions runs on every push to `main`/`develop` and on pull requests to `main`:

1. **Backend tests** — runs `pytest` with coverage, uploads `coverage.xml`
2. **Frontend tests** — runs `jest` with coverage, uploads `lcov.info`
3. **SonarCloud scan** — downloads both coverage reports and sends analysis to SonarCloud

See [`.github/workflows/test.yml`](.github/workflows/test.yml) for the full pipeline.

Required GitHub Secrets:

| Secret | Description |
|---|---|
| `SONAR_TOKEN` | Generated from [sonarcloud.io](https://sonarcloud.io) → My Account → Security |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
