-- CreateTable
CREATE TABLE "UnitFieldMapping" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "mappings" JSONB NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UnitFieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitFieldMapping_projectId_idx" ON "UnitFieldMapping"("projectId");

-- CreateIndex
CREATE INDEX "UnitFieldMapping_userId_idx" ON "UnitFieldMapping"("userId");

-- AddForeignKey
ALTER TABLE "UnitFieldMapping" ADD CONSTRAINT "UnitFieldMapping_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitFieldMapping" ADD CONSTRAINT "UnitFieldMapping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; 