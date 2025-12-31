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
    
    // Get recently released playlists (created in last 30 days, ordered by creation date)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentPlaylists = await prisma.playlist.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        videos: {
          include: {
            progress: {
              where: { userId: user.id }
            }
          }
        },
        category: true
      },
      orderBy: { createdAt: "desc" },
      take: 6
    })

    stats.recentlyReleasedPlaylists = recentPlaylists.map((playlist: any) => {
      const totalCount = playlist.videos.length
      const completedCount = playlist.videos.filter((v: any) => v.progress[0]?.completed).length
      const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      
      return {
        id: playlist.id,
        title: playlist.title,
        description: playlist.description,
        thumbnail: playlist.thumbnail,
        category: playlist.category,
        videos: playlist.videos,
        completedCount,
        totalCount,
        progress,
        firstVideoTitle: playlist.videos[0]?.title || ""
      }
    })
  } catch (error) {
    console.error("Database connection error:", error)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          {getGreeting()}, {user.firstName || user.fullName || "Student"}
        </h1>
        <p className="text-lg text-muted-foreground">
          Ready to unlock your potential? Let's build something amazing together.
        </p>
      </div>

      {/* Continue Learning Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Continue Learning</h2>
        </div>
        
        {stats.continueLearningPlaylists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.continueLearningPlaylists.map(playlist => (
              <ContinueLearningCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="mb-1 text-lg font-semibold">No courses in progress</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Start learning by adding a new playlist or creating a custom one
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/dashboard/playlists/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Playlist
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/playlists/new?type=custom">
                  Create Custom Playlist
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recently Released Section */}
      {stats.recentlyReleasedPlaylists.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recently Released</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/library">
                View All
                <span className="ml-1">→</span>
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.recentlyReleasedPlaylists.map(playlist => (
              <RecentlyReleasedCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
