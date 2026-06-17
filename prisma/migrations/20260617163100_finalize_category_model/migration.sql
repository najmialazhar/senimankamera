-- AlterTable
ALTER TABLE "Package" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Package" DROP COLUMN "category";

-- DropForeignKey
ALTER TABLE "Package" DROP CONSTRAINT "Package_categoryId_fkey";

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
