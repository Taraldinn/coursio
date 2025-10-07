# 🔧 Supabase Database Management Guide

## 🎯 The Issue

Supabase **free tier databases automatically pause** after ~7 days of inactivity or when idle. This is normal behavior to save resources.

**Symptoms:**
```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:6543`
```

---

## ✅ Quick Fix (1 Command)

When you see the database connection error:

```bash
npm run db:test
```

This will:
1. Wake up the database (takes 3-5 seconds)
2. Verify connection
3. Show database status

Then **refresh your browser** - everything will work!

---

## 🚀 Keep Database Active While Coding

### Option 1: Auto Keep-Alive Script (Recommended)

Run this in a **separate terminal** while developing:

```bash
./keep-db-alive.sh
```

This pings the database every 5 minutes to prevent auto-pause.

**To stop:** Press `Ctrl+C`

### Option 2: Manual Keep-Alive Loop

```bash
while true; do npm run db:test; sleep 300; done
```

### Option 3: NPM Script

Add to your workflow:

```bash
# In one terminal
npm run dev

# In another terminal (keeps DB alive)
while sleep 300; do npm run db:test; done
```

---

## 🔍 Troubleshooting

### Check Database Status

```bash
# Quick test
npm run db:test

# Detailed Prisma connection
npx prisma db push

# View database in browser
npx prisma studio
```

### If Database Still Won't Connect

1. **Visit Supabase Dashboard**
   - https://supabase.com/dashboard
   - Project: `gpllsuldiupvtvnigrlp`
   - Click "Resume database" if paused

2. **Check Environment Variables**
   ```bash
   grep DATABASE_URL .env
   ```

3. **Test Direct Connection**
   ```bash
   # Change to direct connection port
   # In .env, temporarily swap:
   DATABASE_URL="postgresql://...@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
   ```

4. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

---

## 💡 Long-term Solutions

### For Development

**Best Practice:** Run the keep-alive script while coding

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Keep database alive
./keep-db-alive.sh
```

### For Production

**Upgrade to Supabase Pro** ($25/month)
- No automatic pausing
- Better performance
- More connections
- 99.9% uptime SLA

### Alternative: Switch to Different Database

Free tiers without auto-pause:
- **Neon** - Never pauses (5 databases free)
- **Railway** - $5 credit/month
- **PlanetScale** - Hobby tier (1 database)

---

## 📊 Database Connection Details

**Current Setup:**
```
Host:     aws-1-us-east-2.pooler.supabase.com
Port:     6543 (pooler) / 5432 (direct)
Database: postgres
Region:   US East 2 (Ohio)
Tier:     Free (auto-pauses after inactivity)
```

**Connection URLs:**
- **Pooler (App):** Port 6543 with PgBouncer
- **Direct (Migrations):** Port 5432 for schema changes

---

## 🛠️ Available Commands

```bash
# Wake up database
npm run db:test

# Push schema changes
npm run db:push
# or
npx prisma db push

# Open Prisma Studio (GUI)
npm run db:studio
# or
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Keep database alive (manual loop)
while true; do npm run db:test; sleep 300; done
```

---

## 📝 package.json Scripts

These scripts are already configured:

```json
{
  "scripts": {
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:test": "tsx test-db-connection.ts"
  }
}
```

---

## ⚡ Quick Reference

| Problem | Solution |
|---------|----------|
| Database paused | `npm run db:test` |
| Keep active while coding | `./keep-db-alive.sh` |
| Check connection | `npm run db:test` |
| View database | `npm run db:studio` |
| Update schema | `npm run db:push` |
| Clear cache | `rm -rf .next` |

---

## 🎯 Best Workflow

### Daily Development

```bash
# Step 1: Start keep-alive (Terminal 1)
./keep-db-alive.sh

# Step 2: Start dev server (Terminal 2)  
npm run dev

# Step 3: Code without interruptions! 🎉
```

### Quick Session

```bash
# Just wake it up and code
npm run db:test && npm run dev
```

---

## 🔄 Auto-Wake on Dev Start

Want to automatically wake the database when starting dev server?

**Update package.json:**

```json
{
  "scripts": {
    "dev": "npm run db:test && next dev --turbopack",
    "dev:keep-alive": "npm-run-all --parallel db:keep-alive dev"
  }
}
```

Then:
```bash
npm run dev  # Auto-wakes database first
```

---

## 📞 Still Having Issues?

1. **Check Supabase Status**
   - https://status.supabase.com

2. **View Supabase Logs**
   - Dashboard → Logs → Database

3. **Enable Debug Mode**
   ```bash
   DEBUG="prisma:*" npm run dev
   ```

4. **Contact Support**
   - Supabase Discord: https://discord.supabase.com
   - GitHub Issues: https://github.com/supabase/supabase

---

## ✅ Summary

**The database pausing is normal for Supabase free tier.**

**Quick fix:** `npm run db:test` (takes 3-5 seconds)

**Prevent it:** Run `./keep-db-alive.sh` while coding

**Long-term:** Upgrade to Pro or use keep-alive script

---

**Updated:** October 7, 2025  
**Status:** ✅ Working - Database wakes in 3-5 seconds
