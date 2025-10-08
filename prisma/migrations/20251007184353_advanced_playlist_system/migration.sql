-- CreateEnum
CREATE TYPE "PlaylistMode" AS ENUM ('YOUTUBE_IMPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'UNLISTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VideoProvider" AS ENUM ('YOUTUBE', 'VIMEO', 'DIRECT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" "PlaylistMode" NOT NULL DEFAULT 'CUSTOM',
    "thumbnail" TEXT,
    "coverImageUrl" TEXT,
    "youtubePlaylistId" TEXT,
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "slug" TEXT NOT NULL,
    "tags" TEXT[],
    "difficulty" "Difficulty",
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "shareableLink" TEXT,
    "qrCodeUrl" TEXT,
    "embedCode" TEXT,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistCollaborator" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlaylistCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "url" TEXT NOT NULL,
    "youtubeId" TEXT,
    "provider" "VideoProvider" NOT NULL DEFAULT 'YOUTUBE',
    "duration" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "playlistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserVideoProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "watchedDuration" INTEGER NOT NULL DEFAULT 0,
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserVideoProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_youtubePlaylistId_key" ON "Playlist"("youtubePlaylistId");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_slug_key" ON "Playlist"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_shareableLink_key" ON "Playlist"("shareableLink");

-- CreateIndex
CREATE INDEX "Playlist_userId_idx" ON "Playlist"("userId");

-- CreateIndex
CREATE INDEX "Playlist_slug_idx" ON "Playlist"("slug");

-- CreateIndex
CREATE INDEX "Playlist_categoryId_idx" ON "Playlist"("categoryId");

-- CreateIndex
CREATE INDEX "Playlist_visibility_idx" ON "Playlist"("visibility");

-- CreateIndex
CREATE INDEX "Playlist_youtubePlaylistId_idx" ON "Playlist"("youtubePlaylistId");

-- CreateIndex
CREATE INDEX "Playlist_tags_idx" ON "Playlist"("tags");

-- CreateIndex
CREATE INDEX "Playlist_difficulty_idx" ON "Playlist"("difficulty");

-- CreateIndex
CREATE INDEX "PlaylistCollaborator_userId_idx" ON "PlaylistCollaborator"("userId");

-- CreateIndex
CREATE INDEX "PlaylistCollaborator_playlistId_idx" ON "PlaylistCollaborator"("playlistId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaylistCollaborator_playlistId_userId_key" ON "PlaylistCollaborator"("playlistId", "userId");

-- CreateIndex
CREATE INDEX "Video_playlistId_idx" ON "Video"("playlistId");

-- CreateIndex
CREATE INDEX "Video_youtubeId_idx" ON "Video"("youtubeId");

-- CreateIndex
CREATE INDEX "Video_position_idx" ON "Video"("position");

-- CreateIndex
CREATE INDEX "UserVideoProgress_userId_idx" ON "UserVideoProgress"("userId");

-- CreateIndex
CREATE INDEX "UserVideoProgress_videoId_idx" ON "UserVideoProgress"("videoId");

-- CreateIndex
CREATE INDEX "UserVideoProgress_completed_idx" ON "UserVideoProgress"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "UserVideoProgress_userId_videoId_key" ON "UserVideoProgress"("userId", "videoId");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistCollaborator" ADD CONSTRAINT "PlaylistCollaborator_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVideoProgress" ADD CONSTRAINT "UserVideoProgress_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
