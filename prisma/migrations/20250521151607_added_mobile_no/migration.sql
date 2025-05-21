/*
  Warnings:

  - You are about to drop the column `mobile` on the `Admin` table. All the data in the column will be lost.
  - You are about to drop the column `mobile` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mobileNo]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobileNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Admin_mobile_key";

-- DropIndex
DROP INDEX "User_mobile_key";

-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "mobile",
ADD COLUMN     "mobileNo" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mobile",
ADD COLUMN     "mobileNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_mobileNo_key" ON "Admin"("mobileNo");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNo_key" ON "User"("mobileNo");
