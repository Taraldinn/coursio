import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PlaylistCard } from "@/components/playlist-card"
import { ProgressStats } from "@/components/progress-stats"
import { Button } from "@/components/ui/button"
import { Plus, PlaySquare } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  let playlists: any[] = []
  let totalPlaylists = 0
  let totalVideos = 0
  let completedVideos = 0
  let totalWatchTime = 0
  let dbError: string | null = null

  try {
    playlists = await prisma.playlist.findMany({
      where: {
        userId: user.id,
      },
      include: {
        videos: {
          include: {
            progress: {
              where: {
                userId: user.id,
              },
            },
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6, // Show recent playlists
    })

    // Calculate statistics
    totalPlaylists = await prisma.playlist.count({
      where: { userId: user.id },
    })
    
    const allVideos = await prisma.video.findMany({
      where: {
        playlist: { userId: user.id },
      },
      include: {
        progress: {
          where: { userId: user.id },
        },
      },
    })

    totalVideos = allVideos.length
    completedVideos = allVideos.filter(v => v.progress[0]?.completed).length
    totalWatchTime = allVideos.reduce(
      (sum, v) => sum + (v.progress[0]?.watchedDuration || 0),
      0
    )
  } catch (error) {
    console.error("Database connection error:", error)
    dbError = "Unable to connect to database. Please check your connection."
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your learning progress across all your courses
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/playlists/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Playlist
          </Link>
        </Button>
      </div>

      {/* Database Error */}
      {dbError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <h3 className="text-sm font-semibold text-destructive">Database Connection Error</h3>
          <p className="mt-1 text-xs text-destructive/90">{dbError}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Please check your Supabase database connection or try again later.
          </p>
        </div>
      )}

      {/* Progress Stats */}
      <ProgressStats
        totalPlaylists={totalPlaylists}
        totalVideos={totalVideos}
        completedVideos={completedVideos}
        totalWatchTime={totalWatchTime}
      />

      {/* Playlists Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Recent Playlists</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/playlists">
              View All
            </Link>
          </Button>
        </div>

        {playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <PlaySquare className="mb-3 h-10 w-10 text-muted-foreground" />
            <h3 className="mb-1 text-base font-semibold">No playlists yet</h3>
            <p className="mb-3 text-xs text-muted-foreground max-w-sm">
              Get started by adding your first YouTube playlist or creating a custom course.
            </p>
            <Button asChild>
              <Link href="/dashboard/playlists/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Playlist
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
