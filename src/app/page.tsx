"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  PlayCircle, 
  BookOpen, 
  LineChart, 
  Youtube, 
  Edit3, 
  TrendingUp,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  Github,
  Zap
} from "lucide-react"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const features = [
  {
    icon: Youtube,
    title: "YouTube Integration",
    description: "Import entire playlists automatically with full video metadata and thumbnails",
    gradient: "from-red-500 to-pink-500"
  },
  {
    icon: Edit3,
    title: "Smart Note Taking",
    description: "Write Markdown notes per video with auto-save. Never lose your thoughts",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Automatic progress saving every 10 seconds. Pick up exactly where you left off",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Users,
    title: "Multi-Auth Support",
    description: "Sign in with GitHub OAuth or traditional email/password authentication",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: Sparkles,
    title: "Beautiful UI",
    description: "Modern interface built with shadcn/ui components and Tailwind CSS v4",
    gradient: "from-orange-500 to-yellow-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built on Next.js 15 with App Router and Turbopack for instant page loads",
    gradient: "from-violet-500 to-purple-500"
  }
]

const benefits = [
  "Import unlimited YouTube playlists",
  "Auto-save notes and progress",
  "Track completion percentage",
  "Dark mode support",
  "Mobile responsive design",
  "Free and open source"
]

export default function HomePage() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const ctaRef = useRef(null)
  
  const heroInView = useInView(heroRef, { once: true })
  const featuresInView = useInView(featuresRef, { once: true })
  const ctaInView = useInView(ctaRef, { once: true })

  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 50])
  const y2 = useTransform(scrollY, [0, 300], [0, -50])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Coursio</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_40%,hsl(var(--primary)/0.1),transparent)]" />
        
        <motion.div 
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate={heroInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="mb-4 gap-2">
                <Sparkles className="h-3 w-3" />
                Built with Next.js 15 & shadcn/ui
              </Badge>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Learn Anything
              <span className="mt-2 block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Track Everything
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
            >
              Transform YouTube playlists into structured courses. Track your progress, 
              take notes, and never lose your place. All for free.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Button size="lg" asChild className="gap-2">
                <Link href="/sign-up">
                  Start Learning Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <Link href="https://github.com/siddharthamaity/nextjs-15-starter-shadcn" target="_blank">
                  <Github className="h-5 w-5" />
                  View Source
                </Link>
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:gap-6"
            >
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                100% free forever
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Open source
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 sm:py-16 md:py-20">
        <motion.div 
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate={featuresInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="mb-12 text-center">
            <motion.div variants={fadeInUp}>
              <Badge variant="outline" className="mb-4">Features</Badge>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            >
              Everything You Need to Learn
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="mt-3 text-base text-muted-foreground sm:text-lg"
            >
              Powerful features designed for serious learners
            </motion.p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <Card className="group relative h-full overflow-hidden border-2 transition-all hover:shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity group-hover:opacity-5`} />
                  <CardHeader className="space-y-3">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.gradient} text-white`}>
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="border-y bg-muted/50 py-12 sm:py-16 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-4">Why Coursio</Badge>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Personal Learning Platform
              </h2>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Stop juggling multiple tabs and losing track of your learning progress. 
                Coursio gives you a centralized dashboard to manage all your educational content.
              </p>
              
              <div className="mt-6 space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm sm:text-base">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <Button size="lg" asChild className="mt-6 gap-2">
                <Link href="/sign-up">
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="h-10 w-3/4 animate-pulse rounded-lg bg-primary/20" />
                  <div className="h-6 w-1/2 animate-pulse rounded-lg bg-primary/10" />
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="h-24 animate-pulse rounded-lg bg-primary/20 sm:h-32" />
                    <div className="h-24 animate-pulse rounded-lg bg-primary/10 sm:h-32" />
                    <div className="h-24 animate-pulse rounded-lg bg-primary/10 sm:h-32" />
                    <div className="h-24 animate-pulse rounded-lg bg-primary/20 sm:h-32" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-12 sm:py-16 md:py-20">
        <motion.div 
          className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          initial="hidden"
          animate={ctaInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <Card className="relative overflow-hidden border-2">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10" />
            <CardContent className="relative px-6 py-10 text-center sm:px-10 sm:py-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
                Join thousands of learners who are already tracking their progress with Coursio. 
                Get started in less than a minute.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild className="gap-2">
                  <Link href="/sign-up">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                <span className="font-bold">Coursio</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Transform YouTube playlists into structured learning experiences.
              </p>
            </div>
            
            <div>
              <h3 className="mb-3 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sign-up" className="text-muted-foreground hover:text-foreground">Get Started</Link></li>
                <li><Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign In</Link></li>
                <li><Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="https://github.com/siddharthamaity/nextjs-15-starter-shadcn" className="text-muted-foreground hover:text-foreground">GitHub</Link></li>
                <li><Link href="https://nextjs.org" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                <li><Link href="https://ui.shadcn.com" className="text-muted-foreground hover:text-foreground">shadcn/ui</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">License</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground sm:text-sm">
            <p>Built with ❤️ using Next.js 15, shadcn/ui, and Tailwind CSS v4</p>
            <p className="mt-2">© 2025 Coursio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
