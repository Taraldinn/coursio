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
    const recentPlaylists = await prisma.playlist.findMany({
      where: {
        // For now, let's just show some playlists, maybe public ones or user's own
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

    stats.recentlyReleasedPlaylists = recentPlaylists.map((playlist: any) => {
      const totalCount = playlist.videos.length
      // Since we don't fetch progress for all public, we might not have it here unless we include it. 
      // But for "Recently Released" usually it's just general course info.
      return {
        ...playlist,
        completedCount: 0,
        totalCount,
        progress: 0,
        firstVideoTitle: playlist.videos[0]?.title || ""
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
