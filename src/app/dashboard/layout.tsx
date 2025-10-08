import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 pl-56">
        <Header />
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
