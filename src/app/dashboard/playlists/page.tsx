import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { PlaylistCard } from "@/components/playlist-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function PlaylistsPage() {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  const playlists = await prisma.playlist.findMany({
    where: { userId: user.id },
    include: {
      videos: {
        include: {
          progress: {
            where: { userId: user.id },
          },
        },
      },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Playlists</h1>
          <p className="text-muted-foreground">
            Manage all your learning playlists in one place
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/playlists/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Playlist
          </Link>
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No playlists yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by adding your first playlist
          </p>
          <Button asChild>
            <Link href="/dashboard/playlists/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Playlist
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  )
}
