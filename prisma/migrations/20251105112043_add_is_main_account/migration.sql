/*
  Warnings:

  - You are about to drop the column `isMainAccount` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "isMainAccount";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mainAccountId" TEXT;
