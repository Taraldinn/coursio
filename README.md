# Coursio

**A Next.js 15 course tracking platform** where users can add YouTube playlists (or custom video lists) as courses, track progress, and write Markdown notes per video with auto-save functionality.

## ✨ Features

- 🎥 **YouTube Integration** - Import entire playlists automatically
- 📝 **Markdown Notes** - Write and auto-save notes for each video
- 📊 **Progress Tracking** - Track completion status and watch time
- 🔐 **Authentication** - GitHub OAuth + email/password signup
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS v4
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- 🌙 **Dark Mode** - Full dark mode support
- 🚀 **Fast** - Built with Next.js 15 App Router and Turbopack

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (v5 beta)
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS v4
- **Video Player**: Plyr
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (Supabase/Neon for free tier)
- YouTube Data API v3 key
- GitHub OAuth app (for GitHub login)
- ImgBB API key (optional, for image uploads)

## 🚀 Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/coursio.git
cd coursio
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install --legacy-peer-deps
# or
bun install
\`\`\`

### 3. Set up environment variables

Copy \`.env.example\` to \`.env\` and fill in your values:

\`\`\`bash
cp .env.example .env
\`\`\`

Required environment variables are documented in \`.env.example\`.

### 4. Set up the database

\`\`\`bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push
\`\`\`

### 5. Run the development server

\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your app.

## 📦 Project Structure

\`\`\`
coursio/
├── src/
│   ├── app/
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Main application
│   │   ├── api/                # API routes
│   │   └── actions/            # Server actions
│   ├── components/             # React components
│   ├── lib/                    # Utilities and configs
│   └── hooks/                  # Custom React hooks
├── prisma/
│   └── schema.prisma           # Database schema
└── public/                     # Static assets
\`\`\`

## 🎯 Usage

### Adding a YouTube Playlist

1. Navigate to Dashboard → Add Playlist
2. Paste a YouTube playlist URL
3. Click "Import Playlist"
4. Videos will be imported automatically

### Creating a Custom Playlist

1. Navigate to Dashboard → Add Playlist
2. Switch to "Custom Playlist" tab
3. Enter title and description

### Tracking Progress

- Video progress is saved automatically every 10 seconds
- Videos are marked complete when you watch to the end
- Progress bars show your completion percentage

### Taking Notes

- Notes are written in Markdown
- Auto-saved after 1 second of inactivity
- Notes are private and linked to your account

## 🔧 Configuration

### Adding shadcn/ui Components

\`\`\`bash
npx shadcn@latest add button card input
\`\`\`

### Database Migrations

\`\`\`bash
npx prisma migrate dev
npx prisma migrate deploy  # For production
\`\`\`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js
- shadcn/ui
- Prisma
- NextAuth.js
- Plyr

---

Made with ❤️ for the open-source community
