import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { PlaylistCard } from "@/components/playlist-card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Playlists</h1>
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

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
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
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  )
}
