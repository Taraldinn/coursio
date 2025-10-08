"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "lucide-react"

interface WeeklyGoalsProps {
  dailyGoal: { current: number; total: number }
  watchTime: { current: number; total: number }
  videosCompleted: { current: number; total: number }
}

export function WeeklyGoals({ dailyGoal, watchTime, videosCompleted }: WeeklyGoalsProps) {
  const dailyProgress = (dailyGoal.current / dailyGoal.total) * 100
  const watchTimeProgress = (watchTime.current / watchTime.total) * 100
  const videosProgress = (videosCompleted.current / videosCompleted.total) * 100

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-lg">This Week</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Daily Goal</span>
            <span className="font-medium">{dailyGoal.current}/{dailyGoal.total} days</span>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Watch Time</span>
            <span className="font-medium">{watchTime.current}/{watchTime.total} hrs</span>
          </div>
          <Progress value={watchTimeProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Videos Completed</span>
            <span className="font-medium">{videosCompleted.current}/{videosCompleted.total}</span>
          </div>
          <Progress value={videosProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}
