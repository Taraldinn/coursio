# 🔥 Quick Database Wake-Up

## If you see "Can't reach database" error:

```bash
npm run db:test
```

Then refresh your browser. Done! ✅

---

## Keep Database Active While Coding

**Run in a separate terminal:**

```bash
./keep-db-alive.sh
```

This pings the database every 5 minutes to prevent Supabase free tier auto-pause.

---

## Why Does This Happen?

Supabase free tier databases **automatically pause after ~7 days of inactivity**. This is normal behavior.

The database wakes up in **3-5 seconds** when you connect to it.

---

## Full Documentation

See [DATABASE_MANAGEMENT.md](./DATABASE_MANAGEMENT.md) for complete guide.

---

## Quick Commands

```bash
# Wake database
npm run db:test

# Keep alive while coding
./keep-db-alive.sh

# Update database schema
npm run db:push

# View database (GUI)
npm run db:studio
```
