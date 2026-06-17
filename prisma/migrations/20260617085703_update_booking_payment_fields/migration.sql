-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "dpAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "snapToken" TEXT,
ADD COLUMN     "snapUrl" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION;
