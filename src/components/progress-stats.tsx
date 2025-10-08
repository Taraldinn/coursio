"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, Target, TrendingUp, Award, ChevronDown } from "lucide-react"
import { useState } from "react"

interface StatsProps {
  totalPlaylists: number
  totalVideos: number
  completedVideos: number
  totalWatchTime: number
}

export function ProgressStats({ totalPlaylists, totalVideos, completedVideos, totalWatchTime }: StatsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const completionPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0
  const watchTimeHours = Math.floor(totalWatchTime / 3600)
  const watchTimeMinutes = Math.floor((totalWatchTime % 3600) / 60)

  const stats = [
    {
      label: "Learning Time",
      value: `${watchTimeHours}h ${watchTimeMinutes}m`,
      icon: Clock,
      change: "+12%",
      positive: true,
    },
    {
      label: "Videos Completed",
      value: `${completedVideos}/${totalVideos}`,
      icon: Target,
      change: `${completionPercentage}%`,
      positive: true,
    },
    {
      label: "Total Playlists",
      value: totalPlaylists.toString(),
      icon: TrendingUp,
      change: "Active",
      positive: true,
    },
    {
      label: "Achievements",
      value: "2",
      icon: Award,
      change: "New!",
      positive: true,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Progress Overview</h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          aria-label={isCollapsed ? "Show stats" : "Hide stats"}
        >
          <span className="text-xs">{isCollapsed ? "Show" : "Hide"}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
          />
        </button>
      </div>

      <div
        className={`grid grid-cols-1 gap-3 transition-all duration-300 origin-top sm:grid-cols-2 lg:grid-cols-4 ${
          isCollapsed ? "h-0 scale-y-0 opacity-0 overflow-hidden" : "h-auto scale-y-100 opacity-100"
        }`}
      >
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className={`text-xs font-medium ${stat.positive ? "text-primary" : "text-muted-foreground"}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-1.5">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
