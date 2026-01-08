"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"

import { cn } from "@/lib/utils"

interface DashboardContentProps {
  children: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  const pathname = usePathname()
  const isVideoPage = pathname?.includes("/video/")

  if (isVideoPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}