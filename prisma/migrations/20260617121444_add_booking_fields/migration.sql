-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "eventLocation" TEXT,
ADD COLUMN     "eventName" TEXT,
ADD COLUMN     "eventTime" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PendingApproval';
