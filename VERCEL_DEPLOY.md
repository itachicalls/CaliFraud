# Vercel Deployment Fix – Database Not Working

## Why You're Seeing Zeros

All fraud data (map, stats, cases) comes from **PostgreSQL**. The news feed works because it fetches from an external URL.  
If totals are 0 and the map is empty, the database is either not connected or not seeded.

---

## Fix Steps

### 1. Verify Vercel Environment Variables

In **Vercel Dashboard → Your Project → Settings → Environment Variables**, confirm:

- `DATABASE_URL` – your Neon (or other) PostgreSQL connection string  
- `DIRECT_URL` – same or direct connection URL (used for migrations)

They must be set for **Production** (and Preview if you use it).

### 2. Check Database Connection

After deploy, open:

```
https://your-site.vercel.app/api/debug
```

You should see something like:

- `database_url_set: true`
- `database_status: "connected"`
- `case_count: <number>`

If `database_status` is `"error"` or `case_count` is `0`, the DB connection or data is wrong.

### 3. Seed the Production Database

The schema is applied during build (`prisma db push`), but data is not seeded automatically.

From your machine (or any environment that can reach your DB):

```bash
# Use your PRODUCTION database URL
DATABASE_URL="your-production-neon-url" DIRECT_URL="your-production-direct-url" npx tsx prisma/seed.ts
```

Or with `.env.production`:

```bash
# Create .env.production with DATABASE_URL and DIRECT_URL
npx dotenv -e .env.production -- npx tsx prisma/seed.ts
```

Replace the URLs with your actual Neon (or other) production DB URLs.

### 4. Redeploy

After seeding:

1. Either trigger a redeploy in Vercel, or  
2. Push a commit so Vercel redeploys.

---

## Quick Checklist

- [ ] `DATABASE_URL` and `DIRECT_URL` set in Vercel
- [ ] `/api/debug` shows `connected` and `case_count > 0`
- [ ] Seed script run against production DB
- [ ] Redeploy completed
