import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ContinueLearningCard } from "@/components/continue-learning-card"
import { RecentlyReleasedCard } from "@/components/recently-released-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Sparkles } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  let stats = {
    continueLearningPlaylists: [] as any[],
    recentlyReleasedPlaylists: [] as any[]
  }

  try {
    const { getDashboardStats } = await import("@/lib/dashboard-data")
    const dashboardStats = await getDashboardStats(user.id)
    stats.continueLearningPlaylists = dashboardStats.continueLearningPlaylists || []

    // Get recently released playlists (simulated query for now, or fetch all public)
    // Get recently released playlists (simulated query for now, or fetch all public)
    let recentPlaylists = []
    try {
      recentPlaylists = await prisma.playlist.findMany({
        where: {
          OR: [
            { visibility: "PUBLIC" },
            { userId: user.id }
          ]
        },
        include: {
          videos: {
            select: {
              id: true,
              duration: true
            }
          },
          category: true
        },
        orderBy: { createdAt: "desc" },
        take: 6
      })
    } catch (e) {
      console.warn("Database connection failed, using mock recent playlists", e)
      // Mock data
      recentPlaylists = [
        {
          id: 'mock-1',
          title: 'Introduction to DevOps',
          description: 'Learn the basics of DevOps.',
          thumbnail: 'https://images.unsplash.com/photo-1607799275518-d58665d099db?auto=format&fit=crop&q=80&w=600',
          slug: 'development-mode',
          author: { name: 'Coursio Team' },
          category: { name: 'DevOps', color: '#10B981' },
          videos: [{ id: 'v1', duration: 120 }, { id: 'v2', duration: 180 }]
        },
        {
          id: 'mock-2',
          title: 'Advanced React Patterns',
          description: 'Master React with advanced patterns.',
          thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
          slug: 'react-advanced',
          author: { name: 'Coursio Team' },
          category: { name: 'Frontend', color: '#3B82F6' },
          videos: [{ id: 'v1', duration: 300 }]
        }
      ] as any
    }

    stats.recentlyReleasedPlaylists = recentPlaylists.map((playlist: any) => {
      const totalCount = playlist.videos.length
      return {
        ...playlist,
        completedCount: 0,
        totalCount,
        progress: 0,
        firstVideoTitle: playlist.videos && playlist.videos[0] ? (playlist.videos[0].title || "Video 1") : ""
      }
    })
  } catch (error) {
    console.error("Database connection error:", error)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-12">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-4">
          {getGreeting()}, {user.firstName || "Student"}
        </h1>
        <p className="text-xl text-zinc-400">
          Ready to unlock your potential? Let's build something amazing together.
        </p>
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-zinc-100">Continue Learning</h2>

        {stats.continueLearningPlaylists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {stats.continueLearningPlaylists.map(playlist => (
              <ContinueLearningCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-12 text-center">
            <Sparkles className="h-10 w-10 text-zinc-500 mb-4" />
            <h3 className="mb-2 text-lg font-semibold text-zinc-300">No courses in progress</h3>
            <div className="flex gap-4 mt-4">
              <Button asChild>
                <Link href="/dashboard/playlists/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Playlist
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recently Released Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Recently Released</h2>
          <Link href="/dashboard/library" className="text-sm text-zinc-400 hover:text-white transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stats.recentlyReleasedPlaylists.map(playlist => (
            <RecentlyReleasedCard key={playlist.id} playlist={playlist} />
          ))}
          {/* Fallback mock cards if needed for demo visual matching */}
          {stats.recentlyReleasedPlaylists.length === 0 && (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-zinc-900/50 animate-pulse" />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
