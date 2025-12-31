"use client"

import { useState, useMemo } from "react"
import { Search, ChevronDown, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExploreCourseCard } from "@/components/explore-course-card"
import { FeaturedCourseCard } from "@/components/featured-course-card"
import { formatDuration } from "@/lib/playlist-utils"
import Link from "next/link"

interface ExploreContentProps {
  playlists: any[]
  featuredPlaylists: any[]
  categories: any[]
  topics: { name: string; count: number }[]
  userId: string
}

type SortOption = "newest" | "oldest" | "title" | "duration"

export function ExploreContent({
  playlists,
  featuredPlaylists,
  categories,
  topics,
  userId
}: ExploreContentProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null)
  const [showAllTopics, setShowAllTopics] = useState(false)

  // Filter and sort playlists
  const filteredPlaylists = useMemo(() => {
    let filtered = [...playlists]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (playlist) =>
          playlist.title.toLowerCase().includes(query) ||
          playlist.description?.toLowerCase().includes(query) ||
          playlist.tags.some((tag: string) => tag.toLowerCase().includes(query))
      )
    }

    // Topic filter
    if (selectedTopics.length > 0) {
      filtered = filtered.filter((playlist) =>
        selectedTopics.some((topic) => playlist.tags.includes(topic))
      )
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((playlist) => playlist.difficulty === selectedDifficulty)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "duration":
          const durationA = a.videos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0)
          const durationB = b.videos.reduce((sum: number, v: any) => sum + (v.duration || 0), 0)
          return durationB - durationA
        default:
          return 0
      }
    })

    return filtered
  }, [playlists, searchQuery, sortBy, selectedTopics, selectedDifficulty])

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const displayedTopics = showAllTopics ? topics : topics.slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Learning Resources</h1>
          <p className="text-lg text-muted-foreground">
            Expand your skills, advance your career, and build your future with our curated learning materials.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses, workshops, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </div>

      {/* Featured Courses */}
      {featuredPlaylists.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Featured Courses</h2>
          <div className="relative">
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {featuredPlaylists.map((playlist) => (
                  <FeaturedCourseCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="flex justify-center gap-1">
            {featuredPlaylists.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === 0 ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Filters</h3>

            {/* Sort */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sorted by:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-normal"
                  onClick={() => {
                    const options: SortOption[] = ["newest", "oldest", "title", "duration"]
                    const currentIndex = options.indexOf(sortBy)
                    const nextIndex = (currentIndex + 1) % options.length
                    setSortBy(options[nextIndex])
                  }}
                >
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Difficulty</h4>
              <div className="space-y-1">
                {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((difficulty) => (
                  <Button
                    key={difficulty}
                    variant={selectedDifficulty === difficulty ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() =>
                      setSelectedDifficulty(
                        selectedDifficulty === difficulty ? null : difficulty
                      )
                    }
                  >
                    {difficulty}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Topics</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 pr-4">
                  {displayedTopics.map((topic) => (
                    <Button
                      key={topic.name}
                      variant={selectedTopics.includes(topic.name) ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => toggleTopic(topic.name)}
                    >
                      <span>{topic.name}</span>
                      <span className="text-xs text-muted-foreground">({topic.count})</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
              {topics.length > 10 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setShowAllTopics(!showAllTopics)}
                >
                  {showAllTopics ? "Show less" : "Show all topics"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Course List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredPlaylists.length} {filteredPlaylists.length === 1 ? "course" : "courses"} found
            </p>
          </div>

          <div className="space-y-3">
            {filteredPlaylists.length > 0 ? (
              filteredPlaylists.map((playlist) => (
                <ExploreCourseCard key={playlist.id} playlist={playlist} userId={userId} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

