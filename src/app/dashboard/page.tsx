import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PlaylistCard } from "@/components/playlist-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, PlaySquare, CheckCircle2, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const playlists = await prisma.playlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      videos: {
        include: {
          progress: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Calculate statistics
  const totalPlaylists = playlists.length
  const totalVideos = playlists.reduce((sum, p) => sum + p.videos.length, 0)
  const completedVideos = playlists.reduce(
    (sum, p) => sum + p.videos.filter(v => v.progress[0]?.completed).length,
    0
  )
  const inProgressVideos = playlists.reduce(
    (sum, p) => sum + p.videos.filter(v => v.progress[0] && !v.progress[0].completed).length,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
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

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Playlists</CardTitle>
            <PlaySquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlaylists}</div>
            <p className="text-xs text-muted-foreground">
              Active learning courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
            <p className="text-xs text-muted-foreground">
              Videos in library
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVideos}</div>
            <p className="text-xs text-muted-foreground">
              Videos finished
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressVideos}</div>
            <p className="text-xs text-muted-foreground">
              Currently watching
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Playlists Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">My Playlists</h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/playlists">
              View All
            </Link>
          </Button>
        </div>

        {playlists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <PlaySquare className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No playlists yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get started by adding your first YouTube playlist or creating a custom course.
              </p>
              <Button asChild>
                <Link href="/dashboard/playlists/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Playlist
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {playlists.slice(0, 6).map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
