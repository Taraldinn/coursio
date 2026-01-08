import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <DashboardContent>{children}</DashboardContent>
  )
}
