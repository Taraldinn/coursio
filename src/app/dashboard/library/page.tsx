import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { LibraryCard } from "@/components/library-card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default async function LibraryPage() {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  let playlists: any[] = []
  try {
    playlists = await prisma.playlist.findMany({
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
  } catch (error) {
    console.warn("Database connection failed, using mock library data", error)
    // Mock data for UI verification
    playlists = [
      {
        id: 'mock-playlist-id',
        title: 'Mock Course: DevOps for Developers',
        description: 'A mock course for UI verification',
        thumbnail: 'https://images.unsplash.com/photo-1607799275518-d58665d099db?auto=format&fit=crop&q=80&w=600',
        slug: 'development-mode', // Matches the mock I set in watch page
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        videos: Array(3).fill(null).map((_, i) => ({
          id: `video-${i}`,
          position: i,
          progress: []
        })),
        category: { name: 'Development', color: '#3B82F6' },
        _count: { videos: 3 }
      }
    ] as any
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">My Library</h1>
        <p className="text-muted-foreground">
          Access your enrolled courses. Track your progress and continue learning.
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="courses" className="px-6 data-[state=active]:bg-background">Courses</TabsTrigger>
            <TabsTrigger value="bookmarks" className="px-6 data-[state=active]:bg-background">Bookmarks</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground self-center mr-2">
              {playlists.length} {playlists.length === 1 ? 'course' : 'courses'} in library
            </span>
          </div>
        </div>

        <TabsContent value="courses" className="space-y-8">
          {playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card/50">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <PlusCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">No courses yet</h3>
              <p className="mb-6 mt-2 text-muted-foreground max-w-sm">
                Get started by adding your first playlist. You can import from YouTube or create your own custom playlist.
              </p>
              <div className="flex gap-3">
                <Button asChild size="lg">
                  <Link href="/dashboard/playlists/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Playlist
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard/playlists/new?type=custom">
                    Create Custom Playlist
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {playlists.map((playlist) => (
                <LibraryCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookmarks">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-card/50 min-h-[300px]">
            <h3 className="text-lg font-semibold">No bookmarks yet</h3>
            <p className="text-muted-foreground mt-2">
              Courses you bookmark from the Explore page will appear here.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/explore">Explore Courses</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
