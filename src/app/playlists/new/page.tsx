import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { PlaylistForm } from '@/components/playlist-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NewPlaylistPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Create New Playlist</h1>
        <p className="text-muted-foreground">
          Import from YouTube or create a custom playlist with videos from multiple sources
        </p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <PlaylistForm categories={categories} />
      </div>
    </div>
  );
}
