# Coursio Setup Guide

## ✅ Database Setup - COMPLETED

Your Supabase PostgreSQL database has been successfully configured and schema pushed!

### Connection Details
- **Region**: us-east-2 (AWS)
- **Database**: PostgreSQL via Supabase
- **Status**: ✅ Schema synced successfully

### Environment Variables Configured

```env
# Session pooling (port 6543) - for app runtime
DATABASE_URL="postgresql://postgres.gpllsuldiupvtvnigrlp:taraismyoldlove@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Transaction pooling (port 5432) - for migrations
DIRECT_URL="postgresql://postgres.gpllsuldiupvtvnigrlp:taraismyoldlove@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"
```

## 🎯 Next Steps

### 1. Create Your First User (Sign Up)
Visit http://localhost:3000/auth/signup and create an account

### 2. Set Up GitHub OAuth (Optional)
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Coursio Dev
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copy the Client ID and Client Secret
5. Update `.env`:
   ```env
   GITHUB_ID="your_client_id_here"
   GITHUB_SECRET="your_client_secret_here"
   ```

### 3. Get YouTube API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create credentials → API Key
5. Update `.env`:
   ```env
   YOUTUBE_API_KEY="your_youtube_api_key_here"
   ```

### 4. Test the Application

#### Import a YouTube Playlist
1. Sign in at http://localhost:3000/auth/signin
2. Go to Dashboard → Add Playlist
3. Paste a YouTube playlist URL (e.g., https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf)
4. Click "Import Playlist"

#### Take Notes on Videos
1. Click on any video in your imported playlist
2. Video player loads automatically
3. Write notes in the Markdown editor below
4. Notes auto-save after 1 second of inactivity

#### Track Your Progress
- Progress saves automatically every 10 seconds
- Videos marked complete when you watch to the end
- Dashboard shows completion percentage

## 🛠️ Useful Commands

```bash
# Start development server
npm run dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate

# View database with Prisma Studio
npx prisma studio --port 5555
```

## 📊 Database Schema

Your database includes these tables:
- ✅ **User** - User accounts and profiles
- ✅ **Account** - OAuth provider accounts
- ✅ **Session** - NextAuth sessions
- ✅ **VerificationToken** - Email verification
- ✅ **Category** - Course categories
- ✅ **Playlist** - Imported/custom playlists
- ✅ **Video** - Individual videos in playlists
- ✅ **UserVideoProgress** - Watch time and completion
- ✅ **Note** - Markdown notes per video

## 🚨 Troubleshooting

### Database Connection Issues
If `prisma db push` hangs:
- Ensure `DIRECT_URL` has `pgbouncer=true&connection_limit=1`
- Check Supabase project is active (not paused)
- Verify password has no special characters that need encoding

### Authentication Not Working
- Check `NEXTAUTH_SECRET` is at least 32 characters
- Verify `NEXTAUTH_URL` matches your local URL
- For GitHub OAuth, ensure callback URL is correct

### YouTube Import Fails
- Verify `YOUTUBE_API_KEY` is valid
- Check API quota hasn't been exceeded
- Ensure playlist is public or unlisted (not private)

## 🎉 You're All Set!

Your Coursio application is ready to use. Visit:
- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Prisma Studio**: http://localhost:5555

Happy learning! 🚀
