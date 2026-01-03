"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { useSidebar } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"

interface DashboardContentProps {
  children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const isVideoPage = pathname?.includes("/video/")

  if (isVideoPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          collapsed ? "ml-16" : "ml-56"
        )}
      >
        <Header />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}