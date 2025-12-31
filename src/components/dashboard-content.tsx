"use client"

import { cn } from "@/lib/utils"
import { useSidebar } from "@/contexts/sidebar-context"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

interface DashboardContentProps {
  children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  const { collapsed } = useSidebar()

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex-1 transition-all duration-300 overflow-x-hidden",
        collapsed ? "pl-16" : "pl-56"
      )}>
        <Header />
        <main className="p-4 overflow-x-hidden max-w-full">
          {children}
        </main>
      </div>
    </div>
  )
}