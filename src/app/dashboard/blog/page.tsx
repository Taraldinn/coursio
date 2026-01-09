import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { BlogContent } from "./blog-content"

export default async function BlogPage() {
    const user = await currentUser()

    if (!user) {
        redirect("/sign-in")
    }

    // Mock blog posts - replace with actual database query
    const posts = [
        {
            id: "1",
            title: "Getting Started with React Hooks",
            excerpt: "Learn the fundamentals of React Hooks and how they can simplify your component logic.",
            content: "",
            author: {
                id: user.id,
                name: user.firstName || "User",
                image: user.imageUrl,
            },
            publishedAt: new Date("2026-01-05"),
            readTime: 5,
            tags: ["React", "JavaScript", "Frontend"],
            views: 234,
            likes: 42,
        },
        {
            id: "2",
            title: "Building Scalable APIs with Node.js",
            excerpt: "Best practices for creating robust and scalable REST APIs using Node.js and Express.",
            content: "",
            author: {
                id: user.id,
                name: user.firstName || "User",
                image: user.imageUrl,
            },
            publishedAt: new Date("2026-01-08"),
            readTime: 8,
            tags: ["Node.js", "API", "Backend"],
            views: 189,
            likes: 28,
        },
    ]

    return <BlogContent posts={posts} />
}
