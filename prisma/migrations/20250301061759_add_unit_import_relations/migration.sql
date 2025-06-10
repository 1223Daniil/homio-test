-- AlterTable
ALTER TABLE "UnitFieldMapping" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UnitImport" ADD COLUMN     "fieldMappingId" TEXT,
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "UnitImport_fieldMappingId_idx" ON "UnitImport"("fieldMappingId");

-- AddForeignKey
ALTER TABLE "UnitImport" ADD CONSTRAINT "UnitImport_fieldMappingId_fkey" FOREIGN KEY ("fieldMappingId") REFERENCES "UnitFieldMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
