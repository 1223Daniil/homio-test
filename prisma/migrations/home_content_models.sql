-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('HERO', 'BLOG_POSTS', 'LIFESTYLE_AREAS', 'CURATED_COLLECTIONS', 'LIFESTYLE_COLUMN', 'UPCOMING_EVENTS', 'CALL_TO_ACTION');

-- CreateEnum
CREATE TYPE "SectionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentRegion" AS ENUM ('GLOBAL', 'THAILAND', 'BALI', 'UAE');

-- CreateTable
CREATE TABLE "HomePageSection" (
    "id" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "status" "SectionStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB DEFAULT '{}',
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePageSectionTranslation" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageSectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifestyleArea" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL DEFAULT 'city',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,
    "locationId" TEXT,

    CONSTRAINT "LifestyleArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifestyleAreaTranslation" (
    "id" TEXT NOT NULL,
    "areaId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifestyleAreaTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuratedCollection" (
    "id" TEXT NOT NULL,
    "mainImage" TEXT NOT NULL,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "CuratedCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CuratedCollectionTranslation" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CuratedCollectionTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Article',
    "image" TEXT,
    "avatar" TEXT,
    "author" TEXT,
    "authorRole" TEXT,
    "readTime" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTranslation" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPostTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpcomingEvent" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "UpcomingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpcomingEventTranslation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UpcomingEventTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "region" "ContentRegion" NOT NULL DEFAULT 'GLOBAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlockTranslation" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlockTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "HomePageSectionTranslation_sectionId_idx" ON "HomePageSectionTranslation"("sectionId");
CREATE UNIQUE INDEX "HomePageSectionTranslation_sectionId_locale_key" ON "HomePageSectionTranslation"("sectionId", "locale");

-- CreateIndex
CREATE INDEX "LifestyleArea_sectionId_idx" ON "LifestyleArea"("sectionId");
CREATE INDEX "LifestyleArea_locationId_idx" ON "LifestyleArea"("locationId");

-- CreateIndex
CREATE INDEX "LifestyleAreaTranslation_areaId_idx" ON "LifestyleAreaTranslation"("areaId");
CREATE UNIQUE INDEX "LifestyleAreaTranslation_areaId_locale_key" ON "LifestyleAreaTranslation"("areaId", "locale");

-- CreateIndex
CREATE INDEX "CuratedCollection_sectionId_idx" ON "CuratedCollection"("sectionId");

-- CreateIndex
CREATE INDEX "CuratedCollectionTranslation_collectionId_idx" ON "CuratedCollectionTranslation"("collectionId");
CREATE UNIQUE INDEX "CuratedCollectionTranslation_collectionId_locale_key" ON "CuratedCollectionTranslation"("collectionId", "locale");

-- CreateIndex
CREATE INDEX "BlogPost_sectionId_idx" ON "BlogPost"("sectionId");

-- CreateIndex
CREATE INDEX "BlogPostTranslation_postId_idx" ON "BlogPostTranslation"("postId");
CREATE UNIQUE INDEX "BlogPostTranslation_postId_locale_key" ON "BlogPostTranslation"("postId", "locale");

-- CreateIndex
CREATE INDEX "UpcomingEvent_sectionId_idx" ON "UpcomingEvent"("sectionId");

-- CreateIndex
CREATE INDEX "UpcomingEventTranslation_eventId_idx" ON "UpcomingEventTranslation"("eventId");
CREATE UNIQUE INDEX "UpcomingEventTranslation_eventId_locale_key" ON "UpcomingEventTranslation"("eventId", "locale");

-- CreateIndex
CREATE INDEX "ContentBlock_sectionId_idx" ON "ContentBlock"("sectionId");
CREATE INDEX "ContentBlock_key_idx" ON "ContentBlock"("key");

-- CreateIndex
CREATE INDEX "ContentBlockTranslation_blockId_idx" ON "ContentBlockTranslation"("blockId");
CREATE UNIQUE INDEX "ContentBlockTranslation_blockId_locale_key" ON "ContentBlockTranslation"("blockId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToProject_AB_unique" ON "_CollectionToProject"("A", "B");
CREATE INDEX "_CollectionToProject_B_index" ON "_CollectionToProject"("B");

-- AddForeignKey
ALTER TABLE "HomePageSectionTranslation" ADD CONSTRAINT "HomePageSectionTranslation_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifestyleArea" ADD CONSTRAINT "LifestyleArea_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LifestyleArea" ADD CONSTRAINT "LifestyleArea_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifestyleAreaTranslation" ADD CONSTRAINT "LifestyleAreaTranslation_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "LifestyleArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuratedCollection" ADD CONSTRAINT "CuratedCollection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CuratedCollectionTranslation" ADD CONSTRAINT "CuratedCollectionTranslation_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "CuratedCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostTranslation" ADD CONSTRAINT "BlogPostTranslation_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpcomingEvent" ADD CONSTRAINT "UpcomingEvent_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UpcomingEventTranslation" ADD CONSTRAINT "UpcomingEventTranslation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "UpcomingEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlock" ADD CONSTRAINT "ContentBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "HomePageSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentBlockTranslation" ADD CONSTRAINT "ContentBlockTranslation_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "ContentBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProject" ADD CONSTRAINT "_CollectionToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "CuratedCollection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CollectionToProject" ADD CONSTRAINT "_CollectionToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE; 