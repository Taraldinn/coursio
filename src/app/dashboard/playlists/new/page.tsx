"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPlaylistFromYouTube, createCustomPlaylist } from "@/app/actions/playlist"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2, Youtube, Plus } from "lucide-react"

export default function NewPlaylistPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // YouTube import state
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [ytTitle, setYtTitle] = useState("")
  const [ytDescription, setYtDescription] = useState("")

  // Custom playlist state
  const [customTitle, setCustomTitle] = useState("")
  const [customDescription, setCustomDescription] = useState("")

  const handleYouTubeImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await createPlaylistFromYouTube(youtubeUrl)

      if (result.error) {
        toast.error(result.error)
      } else if (result.playlistId) {
        toast.success("Playlist imported successfully!")
        router.push(`/dashboard/playlists/${result.playlistId}`)
      }
    } catch (error) {
      toast.error("Failed to import playlist")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomPlaylist = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", customTitle)
      if (customDescription) {
        formData.append("description", customDescription)
      }
      formData.append("visibility", "PUBLIC")

      const result = await createCustomPlaylist(formData)

      if (result.error) {
        toast.error(result.error)
      } else if (result.playlistId) {
        toast.success("Playlist created successfully!")
        router.push(`/dashboard/playlists/${result.playlistId}`)
      }
    } catch (error) {
      toast.error("Failed to create playlist")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Playlist</h1>
        <p className="text-muted-foreground">
          Import from YouTube or create a custom playlist
        </p>
      </div>

      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="youtube">
            <Youtube className="mr-2 h-4 w-4" />
            YouTube Import
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Plus className="mr-2 h-4 w-4" />
            Custom Playlist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <Card>
            <CardHeader>
              <CardTitle>Import from YouTube</CardTitle>
              <CardDescription>
                Enter a YouTube playlist URL to automatically import all videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleYouTubeImport} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube-url">YouTube Playlist URL *</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/playlist?list=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yt-title">Custom Title (optional)</Label>
                  <Input
                    id="yt-title"
                    placeholder="Leave empty to use YouTube playlist title"
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yt-description">Custom Description (optional)</Label>
                  <Textarea
                    id="yt-description"
                    placeholder="Leave empty to use YouTube playlist description"
                    value={ytDescription}
                    onChange={(e) => setYtDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isLoading || !youtubeUrl} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import Playlist"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Playlist</CardTitle>
              <CardDescription>
                Create an empty playlist and add videos manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCustomPlaylist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-title">Playlist Title *</Label>
                  <Input
                    id="custom-title"
                    placeholder="My Awesome Course"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-description">Description (optional)</Label>
                  <Textarea
                    id="custom-description"
                    placeholder="What will students learn in this course?"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={isLoading || !customTitle} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Playlist"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
