"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface LearningStreakProps {
  streak: number
  message?: string
}

export function LearningStreak({ streak, message = "Days in a row" }: LearningStreakProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Learning Streak</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-6">
          <div className="mb-3 rounded-full bg-primary/10 p-4">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          <p className="text-6xl font-bold text-primary">{streak}</p>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Keep it up! You're doing great!
        </p>
      </CardContent>
    </Card>
  )
}
