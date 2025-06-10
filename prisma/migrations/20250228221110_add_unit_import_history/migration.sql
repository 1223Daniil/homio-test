-- CreateTable
CREATE TABLE "UnitImport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "importDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedBy" TEXT,
    "currency" TEXT,
    "priceUpdateDate" TIMESTAMP(3),
    "totalUnits" INTEGER NOT NULL,
    "createdUnits" INTEGER NOT NULL,
    "updatedUnits" INTEGER NOT NULL,
    "skippedUnits" INTEGER NOT NULL,
    "rawData" JSONB NOT NULL,

    CONSTRAINT "UnitImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitVersion" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "versionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "buildingId" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "pricePerSqm" DOUBLE PRECISION,
    "status" "UnitStatus" NOT NULL,
    "area" DOUBLE PRECISION,
    "description" TEXT,
    "windowView" TEXT,
    "metadata" JSONB,

    CONSTRAINT "UnitVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitFieldMapping" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mappings" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitFieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitImport_projectId_idx" ON "UnitImport"("projectId");

-- CreateIndex
CREATE INDEX "UnitImport_importDate_idx" ON "UnitImport"("importDate");

-- CreateIndex
CREATE INDEX "UnitVersion_unitId_idx" ON "UnitVersion"("unitId");

-- CreateIndex
CREATE INDEX "UnitVersion_importId_idx" ON "UnitVersion"("importId");

-- CreateIndex
CREATE INDEX "UnitVersion_versionDate_idx" ON "UnitVersion"("versionDate");

-- CreateIndex
CREATE INDEX "UnitFieldMapping_projectId_idx" ON "UnitFieldMapping"("projectId");

-- CreateIndex
CREATE INDEX "UnitFieldMapping_userId_idx" ON "UnitFieldMapping"("userId");

-- AddForeignKey
ALTER TABLE "UnitImport" ADD CONSTRAINT "UnitImport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitVersion" ADD CONSTRAINT "UnitVersion_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitVersion" ADD CONSTRAINT "UnitVersion_importId_fkey" FOREIGN KEY ("importId") REFERENCES "UnitImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitFieldMapping" ADD CONSTRAINT "UnitFieldMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitFieldMapping" ADD CONSTRAINT "UnitFieldMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
