import { currentUser } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import prisma from "@/lib/prisma"

interface PlaylistPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const user = await currentUser()

  if (!user?.id) {
    redirect("/sign-in")
  }

  const { id } = await params

  const playlist = await prisma.playlist.findUnique({
    where: {
      id,
    },
    select: {
      slug: true,
    },
  })

  if (!playlist?.slug) {
    notFound()
  }

  // Redirect to new playlist route
  redirect(`/playlist/${playlist.slug}`)
}
