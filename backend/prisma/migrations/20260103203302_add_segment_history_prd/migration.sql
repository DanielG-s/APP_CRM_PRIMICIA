-- AlterTable
ALTER TABLE "Segment" ADD COLUMN     "lastCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SegmentHistory" (
    "id" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SegmentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SegmentHistory_segmentId_date_idx" ON "SegmentHistory"("segmentId", "date");

-- AddForeignKey
ALTER TABLE "SegmentHistory" ADD CONSTRAINT "SegmentHistory_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
