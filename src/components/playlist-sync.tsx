"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RefreshCw, Loader2 } from "lucide-react"
import { syncPlaylist, toggleAutoSync } from "@/app/actions/sync-playlist"
import { toast } from "sonner"

interface PlaylistSyncProps {
  playlistId: string
  youtubePlaylistId: string
  autoSync: boolean
  lastSyncedAt: Date | null
}

export function PlaylistSync({ 
  playlistId, 
  youtubePlaylistId, 
  autoSync: initialAutoSync,
  lastSyncedAt 
}: PlaylistSyncProps) {
  const [open, setOpen] = useState(false)
  const [autoSync, setAutoSync] = useState(initialAutoSync)
  const [isPending, startTransition] = useTransition()

  const handleSync = () => {
    startTransition(async () => {
      const result = await syncPlaylist(playlistId, youtubePlaylistId)
      
      if (result.success) {
        toast.success(`Synced successfully! Added ${result.addedCount} new videos.`)
        setOpen(false)
      } else {
        toast.error(result.error || "Failed to sync playlist")
      }
    })
  }

  const handleAutoSyncToggle = (checked: boolean) => {
    setAutoSync(checked)
    startTransition(async () => {
      const result = await toggleAutoSync(playlistId, checked)
      
      if (result.success) {
        toast.success(checked ? "Auto-sync enabled" : "Auto-sync disabled")
      } else {
        toast.error(result.error || "Failed to update auto-sync")
        setAutoSync(!checked) // Revert on error
      }
    })
  }

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never"
    
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    
return `${diffDays}d ago`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Playlist</DialogTitle>
          <DialogDescription>
            Sync videos from YouTube to keep your playlist up to date
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Last Synced Info */}
          <div className="text-sm text-muted-foreground">
            Last synced: <span className="font-medium">{formatLastSync(lastSyncedAt)}</span>
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Auto-sync</Label>
              <p className="text-sm text-muted-foreground">
                Automatically sync new videos daily
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={handleAutoSyncToggle}
              disabled={isPending}
            />
          </div>

          {/* Manual Sync Button */}
          <Button 
            onClick={handleSync} 
            disabled={isPending} 
            className="w-full"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
