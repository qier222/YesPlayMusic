-- CreateTable
CREATE TABLE "AccountData" IF NOT EXISTS (
    "id" TEXT NOT NULL PRIMARY KEY,
    "json" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppData" IF NOT EXISTS (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Track" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Album" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Artist" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ArtistAlbum" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hotAlbums" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Playlist" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Audio" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "bitRate" INTEGER NOT NULL,
    "format" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "queriedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Lyrics" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppleMusicAlbum" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppleMusicArtist" IF NOT EXISTS (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "json" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AccountData_id_key" ON "AccountData"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AppData_id_key" ON "AppData"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Track_id_key" ON "Track"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Album_id_key" ON "Album"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Artist_id_key" ON "Artist"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ArtistAlbum_id_key" ON "ArtistAlbum"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Playlist_id_key" ON "Playlist"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Audio_id_key" ON "Audio"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Lyrics_id_key" ON "Lyrics"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AppleMusicAlbum_id_key" ON "AppleMusicAlbum"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "AppleMusicArtist_id_key" ON "AppleMusicArtist"("id");
