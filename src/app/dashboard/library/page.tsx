import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { LibraryCard } from "@/components/library-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default async function LibraryPage() {
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
            where: { userId: user.id }
          }
        },
        orderBy: { position: "asc" }
      },
      category: true
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">My Library</h1>
        <p className="text-lg text-muted-foreground">
          Access your enrolled courses. Track your progress and continue learning.
        </p>
      </div>

      <div className="flex items-center gap-2 border-b">
        <Button variant="ghost" className="rounded-b-none border-b-2 border-primary">
          Courses
        </Button>
        <Button variant="ghost" className="rounded-b-none">
          Bookmarks
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {playlists.length} {playlists.length === 1 ? 'course' : 'courses'} in your library
        </p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/playlists/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Playlist
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/playlists/new?type=custom">
              Create Custom Playlist
            </Link>
          </Button>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by adding your first playlist
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
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <LibraryCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}
    </div>
  )
}

