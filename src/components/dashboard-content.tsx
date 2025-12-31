"use client"

import { Header } from "@/components/header"

interface DashboardContentProps {
  children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="overflow-x-hidden max-w-full">
        {children}
      </main>
    </div>
  )
}