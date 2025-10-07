# 🔧 Database Connection Troubleshooting

## ❌ Current Error
```
Can't reach database server at `aws-1-us-east-2.pooler.supabase.com:6543`
```

## 🎯 Root Cause
Your **Supabase database has paused** due to inactivity (free tier behavior). Supabase free tier databases automatically pause after 7 days of inactivity or when not in use.

## ✅ Solutions (Try in Order)

### **Solution 1: Wake Up Database via Supabase Dashboard** ⭐ RECOMMENDED
This is the fastest and most reliable method:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project**: `gpllsuldiupvtvnigrlp`
3. **Go to Settings** → **Database**
4. **Click "Resume database"** or **"Unpause"** button
5. **Wait 30-60 seconds** for database to fully wake up
6. **Refresh your app** at http://localhost:3000

### **Solution 2: Restart Dev Server**
After waking the database:

```bash
# Stop the current dev server (Ctrl+C if running)
npm run dev
```

### **Solution 3: Test Database Connection**
Verify database is accessible:

```bash
# Test Prisma connection
npx prisma db push

# If successful, you'll see:
# ✓ Database synchronized with Prisma schema
```

### **Solution 4: Use Direct Connection** (If pooler fails)
Update `.env` temporarily for testing:

```env
# Swap these two lines (use direct connection for both)
DATABASE_URL="postgresql://postgres.gpllsuldiupvtvnigrlp:taraismyoldlove@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.gpllsuldiupvtvnigrlp:taraismyoldlove@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
```

Then restart:
```bash
npm run dev
```

### **Solution 5: Check Supabase Project Status**
Ensure your Supabase project is active:

1. Visit: https://supabase.com/dashboard/project/gpllsuldiupvtvnigrlp
2. Check project status (top of dashboard)
3. If paused, click **"Resume"**

### **Solution 6: Verify Network/Firewall**
Ensure your network allows connections:

```bash
# Test direct connection to database
nc -zv aws-1-us-east-2.pooler.supabase.com 6543

# If connection works, you'll see:
# Connection to aws-1-us-east-2.pooler.supabase.com port 6543 [tcp/*] succeeded!
```

### **Solution 7: Check Database Credentials**
Verify your credentials in Supabase Dashboard:

1. Go to **Settings** → **Database**
2. Compare:
   - Host: `aws-1-us-east-2.pooler.supabase.com`
   - Port: `6543` (pooler) or `5432` (direct)
   - Database: `postgres`
   - User: `postgres.gpllsuldiupvtvnigrlp`
   - Password: `taraismyoldlove`

3. Update `.env` if anything changed

## 🚀 Quick Fix Commands

```bash
# 1. Kill all Node processes
pkill -f "next dev"

# 2. Clear Next.js cache
rm -rf .next

# 3. Restart dev server
npm run dev
```

## 🔄 Long-term Prevention

### **Upgrade to Supabase Pro** (Recommended for production)
- No automatic pausing
- Better performance
- More connection pooling
- Cost: $25/month

### **Keep Database Active** (Free tier workaround)
Create a cron job to ping database daily:

```bash
# Add to crontab (crontab -e)
0 10 * * * curl "https://gpllsuldiupvtvnigrlp.supabase.co/rest/v1/" -H "apikey: YOUR_ANON_KEY"
```

### **Use Supabase API for Health Checks**
Add a health check endpoint that queries database:

```typescript
// src/app/api/health/route.ts
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: "ok", database: "connected" })
  } catch (error) {
    return Response.json({ status: "error", database: "disconnected" }, { status: 500 })
  }
}
```

## 📊 Current Configuration

**Your Database URLs:**
```
Pooler (App):    aws-1-us-east-2.pooler.supabase.com:6543
Direct (Migrate): aws-1-us-east-2.pooler.supabase.com:5432
Region:          us-east-2 (Ohio)
```

**Connection Settings:**
- Pooler uses PgBouncer (port 6543)
- Direct connection (port 5432)
- SSL enabled by default

## 🐛 Debug Info

If issue persists, check Prisma logs:

```bash
# Enable debug logging
DEBUG="prisma:*" npm run dev
```

Check Supabase logs:
1. Dashboard → **Logs** → **Database**
2. Look for connection errors

## 📞 Need Help?

**Supabase Support:**
- Dashboard: https://supabase.com/dashboard/support
- Discord: https://discord.supabase.com
- Docs: https://supabase.com/docs/guides/platform/going-into-prod

**Current Status:**
- Project ID: `gpllsuldiupvtvnigrlp`
- Region: US East 2
- Tier: Free (auto-pauses after inactivity)

---

## ✅ After Database Wakes Up

Once database is running:

1. ✅ Refresh your app at http://localhost:3000
2. ✅ Navigate to a video page to test
3. ✅ Verify resizable panels work
4. ✅ Test video player controls
5. ✅ Check note-taking functionality

**Expected behavior:**
- Video loads immediately
- Controls are fully functional
- Progress saves automatically
- Notes auto-save after 1 second

---

**Last Updated:** October 7, 2025
**Status:** Database paused - needs manual resume via Supabase Dashboard
