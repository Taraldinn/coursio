import { Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CertificatesPage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-6">
                <Award className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
                Complete courses to earn certificates. Your achievements will appear here.
            </p>
            <Button asChild className="mt-8">
                <Link href="/dashboard/playlists">Browse Courses</Link>
            </Button>
        </div>
    )
}
