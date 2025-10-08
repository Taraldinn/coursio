"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Clock, TrendingUp, ListVideo } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: "courses" | "hours" | "completion" | "playlists"
  iconColor: string
}

const icons = {
  courses: BookOpen,
  hours: Clock,
  completion: TrendingUp,
  playlists: ListVideo,
}

export function DashboardStatsCard({ title, value, subtitle, icon, iconColor }: StatsCardProps) {
  const Icon = icons[icon]
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`rounded-lg p-3 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
