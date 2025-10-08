import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { DashboardStatsCard } from "@/components/dashboard-stats-card"
import { WeeklyGoals } from "@/components/weekly-goals"
import { LearningStreak } from "@/components/learning-streak"
import { ContinueLearningCard } from "@/components/continue-learning-card"
import { Button } from "@/components/ui/button"
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
  let activePlaylistsCount = 0
  let weeklyWatchTime = 0
  let weeklyCompletedVideos = 0

  try {
    // Get all playlists with progress
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
        updatedAt: "desc",
      },
    })

    // Calculate statistics
    totalPlaylists = playlists.length
    
    const allVideos = playlists.flatMap(p => p.videos)
    totalVideos = allVideos.length
    completedVideos = allVideos.filter(v => v.progress[0]?.completed).length
    totalWatchTime = allVideos.reduce(
      (sum, v) => sum + (v.progress[0]?.watchedDuration || 0),
      0
    )

    // Active playlists (with at least one video started)
    activePlaylistsCount = playlists.filter(p => 
      p.videos.some((v: any) => v.progress.length > 0)
    ).length

    // Weekly stats (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyProgress = await prisma.userVideoProgress.findMany({
      where: {
        userId: user.id,
        updatedAt: {
          gte: weekAgo,
        },
      },
    })

    weeklyWatchTime = weeklyProgress.reduce((sum, p) => sum + p.watchedDuration, 0)
    weeklyCompletedVideos = weeklyProgress.filter(p => p.completed).length

  } catch (error) {
    console.error("Database connection error:", error)
  }

  // Format playlists for Continue Learning section
  const continueLearningPlaylists = playlists
    .map(playlist => {
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
      }
    })
    .filter(p => p.progress > 0 && p.progress < 100)
    .slice(0, 3)

  const watchTimeHours = Math.floor(totalWatchTime / 3600)
  const completionRate = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
  const weeklyHours = Math.floor(weeklyWatchTime / 3600)
  const weeklyMinutes = Math.floor((weeklyWatchTime % 3600) / 60)

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {user.firstName || "Student"}
        </h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsCard
          title="Total Courses"
          value={totalPlaylists}
          subtitle={`+2 this month`}
          icon="courses"
          iconColor="bg-blue-500/10 text-blue-500"
        />
        <DashboardStatsCard
          title="Hours Watched"
          value={watchTimeHours.toFixed(1)}
          subtitle={`+8.2 this week`}
          icon="hours"
          iconColor="bg-emerald-500/10 text-emerald-500"
        />
        <DashboardStatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle={`+12% from last month`}
          icon="completion"
          iconColor="bg-violet-500/10 text-violet-500"
        />
        <DashboardStatsCard
          title="Active Playlists"
          value={activePlaylistsCount}
          subtitle={`${activePlaylistsCount - 1} in progress`}
          icon="playlists"
          iconColor="bg-orange-500/10 text-orange-500"
        />
      </div>

      {/* Continue Learning & This Week Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Continue Learning Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Continue Learning</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/playlists">
                View All
                <span className="ml-1">→</span>
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {continueLearningPlaylists.length > 0 ? (
              continueLearningPlaylists.map(playlist => (
                <ContinueLearningCard key={playlist.id} playlist={playlist} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <h3 className="mb-1 text-base font-semibold">No courses in progress</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Start learning by adding a new playlist
                </p>
                <Button asChild>
                  <Link href="/dashboard/playlists/new">Add Playlist</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* This Week Card */}
          <WeeklyGoals
            dailyGoal={{ current: 4, total: 7 }}
            watchTime={{ current: weeklyHours + (weeklyMinutes / 60), total: 12 }}
            videosCompleted={{ current: weeklyCompletedVideos, total: 15 }}
          />

          {/* Learning Streak Card */}
          <LearningStreak streak={12} message="Days in a row" />
        </div>
      </div>
    </div>
  )
}
