-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'website';

-- AlterTable
ALTER TABLE "Gallery" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mediaType" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "storagePath" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "CalendarSlot" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "bookingId" TEXT,
    "blockedReason" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSlot_date_key" ON "CalendarSlot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarSlot_bookingId_key" ON "CalendarSlot"("bookingId");

-- AddForeignKey
ALTER TABLE "CalendarSlot" ADD CONSTRAINT "CalendarSlot_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
