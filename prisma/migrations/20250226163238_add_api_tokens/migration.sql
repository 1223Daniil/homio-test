/*
  Warnings:

  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatMessageToProject` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ImportType" AS ENUM ('UNITS', 'BUILDINGS', 'LAYOUTS', 'PRICES');

-- CreateEnum
CREATE TYPE "ApiTokenType" AS ENUM ('PROJECT_DATA', 'PRICE_DATA');

-- DropForeignKey
ALTER TABLE "Building" DROP CONSTRAINT "Building_projectId_fkey";

-- DropForeignKey
ALTER TABLE "MasterPlanPoint" DROP CONSTRAINT "MasterPlanPoint_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentPlan" DROP CONSTRAINT "PaymentPlan_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_locationId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectAmenity" DROP CONSTRAINT "ProjectAmenity_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectDocument" DROP CONSTRAINT "ProjectDocument_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectEmbedding" DROP CONSTRAINT "ProjectEmbedding_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMedia" DROP CONSTRAINT "ProjectMedia_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectPricing" DROP CONSTRAINT "ProjectPricing_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTranslation" DROP CONSTRAINT "ProjectTranslation_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectVideo" DROP CONSTRAINT "ProjectVideo_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectYield" DROP CONSTRAINT "ProjectYield_projectId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyType" DROP CONSTRAINT "PropertyType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_projectId_fkey";

-- DropForeignKey
ALTER TABLE "UnitLayout" DROP CONSTRAINT "UnitLayout_projectId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatMessageToProject" DROP CONSTRAINT "_ChatMessageToProject_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatMessageToProject" DROP CONSTRAINT "_ChatMessageToProject_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectToUserContext" DROP CONSTRAINT "_ProjectToUserContext_A_fkey";

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "FloorPlan" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "projectId" TEXT;

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "_ChatMessageToProject";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "class" "ProjectClass",
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportConfiguration" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "ImportType" NOT NULL,
    "configuration" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "ApiTokenType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsed" TIMESTAMP(3),
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToChatMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE INDEX "projects_developerId_idx" ON "projects"("developerId");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_type_idx" ON "projects"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ImportConfiguration_projectId_type_key" ON "ImportConfiguration"("projectId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_token_key" ON "ApiToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToChatMessage_AB_unique" ON "_ProjectToChatMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToChatMessage_B_index" ON "_ProjectToChatMessage"("B");

-- CreateIndex
CREATE INDEX "Favorite_projectId_idx" ON "Favorite"("projectId");

-- CreateIndex
CREATE INDEX "FloorPlan_projectId_idx" ON "FloorPlan"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_projectId_key" ON "Location"("projectId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTranslation" ADD CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyType" ADD CONSTRAINT "PropertyType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectYield" ADD CONSTRAINT "ProjectYield_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPricing" ADD CONSTRAINT "ProjectPricing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVideo" ADD CONSTRAINT "ProjectVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPlanPoint" ADD CONSTRAINT "MasterPlanPoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEmbedding" ADD CONSTRAINT "ProjectEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorPlan" ADD CONSTRAINT "FloorPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportConfiguration" ADD CONSTRAINT "ImportConfiguration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUserContext" ADD CONSTRAINT "_ProjectToUserContext_A_fkey" FOREIGN KEY ("A") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToChatMessage" ADD CONSTRAINT "_ProjectToChatMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToChatMessage" ADD CONSTRAINT "_ProjectToChatMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE; 