"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LogOut,
  Settings,
  Bell,
  Home,
  MessageSquare,
  Globe,
  BookOpen,
  Gem,
  HelpCircle,
  Moon,
  Sun
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { useTheme } from "next-themes"

export function Header() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { name: "Explore", href: "/dashboard/explore", icon: Globe },
    { name: "Blogs", href: "/dashboard/blogs", icon: BookOpen },
    { name: "My Library", href: "/dashboard/library", icon: BookOpen },
    { name: "Discussion", href: "/dashboard/discussion", icon: MessageSquare },
  ]

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-full items-center justify-between px-6">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/dashboard">
            <Logo size="md" showText={true} />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              className="bg-muted/50 hover:bg-muted"
              asChild
            >
              <Link href="/dashboard/become-instructor" className="flex items-center gap-2">
                <span className="text-xs">Become An Instructor</span>
              </Link>
            </Button>
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Upgrade Button */}
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Gem className="h-4 w-4 mr-2" />
            Upgrade
          </Button>

          {/* Home Icon */}
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" asChild>
            <Link href="/dashboard">
              <Home className="h-5 w-5" />
            </Link>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                  <AvatarFallback className="text-xs bg-primary/10">
                    {user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.imageUrl} alt={user?.firstName || ""} />
                  <AvatarFallback className="text-sm bg-primary/10">
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild className="cursor-pointer p-2">
                <Link href="/dashboard/settings">
                  <Settings className="mr-3 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer p-2">
                <Link href="/help">
                  <HelpCircle className="mr-3 h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer p-2">
                {theme === 'dark' ? (
                  <Sun className="mr-3 h-4 w-4" />
                ) : (
                  <Moon className="mr-3 h-4 w-4" />
                )}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer p-2 text-red-500 focus:text-red-500">
                <LogOut className="mr-3 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
