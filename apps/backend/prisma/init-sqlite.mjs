import { DatabaseSync } from "node:sqlite";
import { existsSync, statSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";

const databasePath = fileURLToPath(new URL("./dev.db", import.meta.url));
if (existsSync(databasePath) && statSync(databasePath).size === 0) unlinkSync(databasePath);
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA foreign_keys=ON;
  CREATE TABLE IF NOT EXISTS "User" ("id" TEXT PRIMARY KEY NOT NULL,"name" TEXT NOT NULL,"email" TEXT NOT NULL,"passwordHash" TEXT NOT NULL,"role" TEXT NOT NULL DEFAULT 'TOURIST',"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  CREATE TABLE IF NOT EXISTS "Place" ("id" TEXT PRIMARY KEY NOT NULL,"title" TEXT NOT NULL,"district" TEXT NOT NULL,"category" TEXT NOT NULL,"latitude" REAL NOT NULL,"longitude" REAL NOT NULL,"story" TEXT NOT NULL,"history" TEXT NOT NULL,"audioGuide" TEXT NOT NULL,"videoUrl" TEXT,"bestTime" TEXT,"travelTip" TEXT,"localFood" TEXT,"safetyNote" TEXT,"accessibility" TEXT,"durationMinutes" INTEGER NOT NULL DEFAULT 30,"panoramaDataUrl" TEXT NOT NULL,"imageMime" TEXT NOT NULL,"imageSizeBytes" INTEGER NOT NULL,"mapX" REAL NOT NULL,"mapY" REAL NOT NULL,"status" TEXT NOT NULL DEFAULT 'PUBLISHED',"authorId" TEXT NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL,CONSTRAINT "Place_authorId_fkey" FOREIGN KEY("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE);
  CREATE INDEX IF NOT EXISTS "Place_district_idx" ON "Place"("district"); CREATE INDEX IF NOT EXISTS "Place_category_idx" ON "Place"("category"); CREATE INDEX IF NOT EXISTS "Place_latitude_longitude_idx" ON "Place"("latitude","longitude");
  CREATE TABLE IF NOT EXISTS "PlaceMedia" ("id" TEXT PRIMARY KEY NOT NULL,"type" TEXT NOT NULL,"caption" TEXT,"dataUrl" TEXT NOT NULL,"mimeType" TEXT NOT NULL,"sizeBytes" INTEGER NOT NULL,"sortOrder" INTEGER NOT NULL DEFAULT 0,"placeId" TEXT NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "PlaceMedia_placeId_fkey" FOREIGN KEY("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE);
  CREATE INDEX IF NOT EXISTS "PlaceMedia_placeId_idx" ON "PlaceMedia"("placeId"); CREATE INDEX IF NOT EXISTS "PlaceMedia_type_idx" ON "PlaceMedia"("type");
  CREATE TABLE IF NOT EXISTS "Comment" ("id" TEXT PRIMARY KEY NOT NULL,"body" TEXT NOT NULL,"placeId" TEXT NOT NULL,"userId" TEXT NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "Comment_placeId_fkey" FOREIGN KEY("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE,CONSTRAINT "Comment_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE);
`);
db.close();
console.log(`Initialized SQLite database at ${databasePath}`);
