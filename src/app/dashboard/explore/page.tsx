import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ExploreContent } from "@/components/explore-content"

export default async function ExplorePage() {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  // Get all public playlists (excluding current user's)
  const publicPlaylists = await prisma.playlist.findMany({
    where: {
      visibility: "PUBLIC",
      userId: {
        not: user.id
      }
    },
    include: {
      category: true,
      videos: {
        select: {
          id: true,
          duration: true
        }
      },
      _count: {
        select: {
          videos: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  // Format playlists with slug
  const formattedPlaylists = publicPlaylists.map((playlist) => ({
    ...playlist,
    slug: playlist.slug || playlist.id
  }))

  // Get all categories with counts
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          playlists: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  })

  // Get all unique tags with counts
  const allPlaylists = await prisma.playlist.findMany({
    where: {
      visibility: "PUBLIC"
    },
    select: {
      tags: true
    }
  })

  const tagCounts: Record<string, number> = {}
  allPlaylists.forEach(playlist => {
    playlist.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const topics = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Get featured playlists (newest or most popular)
  const featuredPlaylists = formattedPlaylists.slice(0, 4)

  return (
    <div className="container mx-auto px-6 py-8">
      <ExploreContent
        playlists={formattedPlaylists}
        featuredPlaylists={featuredPlaylists}
        categories={categories}
        topics={topics}
        userId={user.id}
      />
    </div>
  )
}

