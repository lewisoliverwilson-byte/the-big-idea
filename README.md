# The Big Idea 💡

**AI-powered dropshipping market research.** Enter a budget, get a full report: buy prices from Temu/AliExpress/Alibaba cross-referenced with Amazon/eBay/Etsy sell prices, margin calculations, trend charts, and a GPT-4o written analysis — in under 30 seconds.

**Live site:** https://main.dh20jci5d0961.amplifyapp.com

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| Backend | Python 3.11 + FastAPI + Mangum |
| Database | PostgreSQL 15 on AWS RDS (db.t3.micro) |
| Auth | AWS Cognito (email/password + Google OAuth) |
| Payments | Stripe Checkout + Customer Portal |
| AI | OpenAI GPT-4o |
| Hosting | AWS Amplify (frontend) + AWS Lambda (backend) |
| IaC | AWS SAM |
| CI/CD | GitHub Actions (backend), Amplify auto-deploy (frontend) |

---

## Repository Structure

```
the-big-idea/
├── frontend/               # React + Vite application
│   └── src/
│       ├── pages/          # Landing, Dashboard, ReportPage, Pricing, Account, Auth
│       ├── components/     # SearchForm, ReportCharts, MarginCalculator, etc.
│       ├── services/       # API client (axios + Cognito JWT)
│       ├── store/          # Zustand auth + report stores
│       ├── hooks/          # useAuth
│       └── types/          # Full TypeScript type definitions
├── backend/
│   └── app/
│       ├── api/            # FastAPI routers: auth, reports, products, billing, user
│       ├── models/         # SQLAlchemy models: User, Product, Report
│       ├── schemas/        # Pydantic request/response schemas
│       ├── services/       # report_service, ai_service, stripe_service
│       └── db/             # SQLAlchemy engine + session
├── infrastructure/
│   └── template.yaml       # AWS SAM template
├── scripts/
│   ├── migrate.mjs         # DB migration (Node.js + pg)
│   └── seed.mjs            # Seeds 20 products (Node.js + pg)
└── .github/workflows/
    └── deploy-backend.yml  # GitHub Actions: SAM build + deploy
```

---

## AWS Resources

| Resource | ID / Endpoint |
|---|---|
| Amplify App | `dh20jci5d0961` |
| Amplify URL | `https://main.dh20jci5d0961.amplifyapp.com` |
| API Gateway | `https://ppnp5cy2xc.execute-api.us-east-1.amazonaws.com/prod` |
| RDS Instance | `the-big-idea-db.c6faseyqm4h7.us-east-1.rds.amazonaws.com` |
| Cognito User Pool | `us-east-1_3af22R2qb` |
| Cognito Client | `7ht58206svpj431kl4eeus1kj1` |
| Cognito Domain | `the-big-idea-auth.auth.us-east-1.amazoncognito.com` |
| CloudFormation Stack | `the-big-idea` (us-east-1) |

---

## GitHub Secrets Required

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM user key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/the_big_idea` |
| `OPENAI_API_KEY` | OpenAI API key (GPT-4o) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `STRIPE_PRO_PRICE_ID` | Stripe recurring price ID (`price_...`) |
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `COGNITO_CLIENT_ID` | Cognito App Client ID |
| `FRONTEND_URL` | Amplify URL (for CORS + Stripe redirects) |

---

## Amplify Environment Variables

Set on the `main` branch in the Amplify console:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://ppnp5cy2xc.execute-api.us-east-1.amazonaws.com/prod` |
| `VITE_COGNITO_USER_POOL_ID` | `us-east-1_3af22R2qb` |
| `VITE_COGNITO_CLIENT_ID` | `7ht58206svpj431kl4eeus1kj1` |
| `VITE_COGNITO_DOMAIN` | `the-big-idea-auth.auth.us-east-1.amazoncognito.com` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` |

---

## Local Development

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

`.env.local` should contain:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_COGNITO_USER_POOL_ID=us-east-1_3af22R2qb
VITE_COGNITO_CLIENT_ID=7ht58206svpj431kl4eeus1kj1
VITE_COGNITO_DOMAIN=the-big-idea-auth.auth.us-east-1.amazoncognito.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set environment variables:
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
COGNITO_USER_POOL_ID=us-east-1_3af22R2qb
COGNITO_CLIENT_ID=7ht58206svpj431kl4eeus1kj1
FRONTEND_URL=http://localhost:5173
```

### Database Setup

```bash
cd scripts
npm install  # installs pg
DATABASE_URL=postgresql://... node migrate.mjs
DATABASE_URL=postgresql://... node seed.mjs
```

---

## Deploying

### Backend

Push to `main` with changes in `backend/`, `infrastructure/`, or `scrapers/` — GitHub Actions will run SAM build + deploy automatically.

Manual trigger: `gh workflow run deploy-backend.yml --ref main`

### Frontend

Push to `main` — Amplify auto-deploys from GitHub.

Manual trigger: `aws amplify start-job --app-id dh20jci5d0961 --branch-name main --job-type RELEASE`

---

## Features

- **Search**: Budget, product size, category, target platforms, margin slider, trending toggle, keywords to avoid
- **Reports**: Full AI analysis (GPT-4o), margin calculator, 12-month trend charts, platform comparison table, buy sources, where to sell
- **Free tier**: 2 complete reports, no card required
- **Pro tier**: Unlimited reports at £19.99/month (Stripe)
- **Auth**: Email/password + Google OAuth via Cognito
- **Account**: Subscription management via Stripe Customer Portal

---

## Stripe

- **Webhook endpoint**: `https://ppnp5cy2xc.execute-api.us-east-1.amazonaws.com/prod/api/v1/billing/webhook`
- **Events**: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
- **Pro product**: `prod_UYK4jEsqQ3PH80` / `price_1TZDQG2SpMd1vcu66kfz0WUO` (£19.99/month)

---

*Built by ConstruX Group · Powered by AWS, OpenAI, Stripe*
