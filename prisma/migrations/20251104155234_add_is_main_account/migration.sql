/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `balance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.
  - The `ownerId` column on the `Account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `monthlyBalance` on the `Category` table. All the data in the column will be lost.
  - The primary key for the `Expense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `category` on the `Expense` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserToAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lastMonthlyBalance` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Account` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Category` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `amount` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shared` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `accountId` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserToAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `accountId` on the `UserToAccount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CASH', 'BANK', 'SHARED');

-- CreateEnum
CREATE TYPE "Month" AS ENUM ('JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER');

-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Expense" DROP CONSTRAINT "Expense_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserToAccount" DROP CONSTRAINT "UserToAccount_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserToAccount" DROP CONSTRAINT "UserToAccount_userId_fkey";

-- DropIndex
DROP INDEX "public"."Account_ownerId_key";

-- AlterTable
ALTER TABLE "Account" DROP CONSTRAINT "Account_pkey",
ADD COLUMN     "isMainAccount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastMonthlyBalance" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "type" "AccountType" NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2),
DROP COLUMN "ownerId",
ADD COLUMN     "ownerId" UUID,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Category" DROP CONSTRAINT "Category_pkey",
DROP COLUMN "monthlyBalance",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_pkey",
DROP COLUMN "category",
ADD COLUMN     "amount" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "categoryId" UUID NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "shared" BOOLEAN NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "accountId",
ADD COLUMN     "accountId" UUID NOT NULL,
ADD CONSTRAINT "Expense_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "surname" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "name" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserToAccount" DROP CONSTRAINT "UserToAccount_pkey",
DROP COLUMN "userId",
ADD COLUMN     "userId" UUID NOT NULL,
DROP COLUMN "accountId",
ADD COLUMN     "accountId" UUID NOT NULL,
ADD CONSTRAINT "UserToAccount_pkey" PRIMARY KEY ("userId", "accountId");

-- CreateTable
CREATE TABLE "MonthlyBalance" (
    "id" UUID NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "month" "Month" NOT NULL,
    "year" INTEGER NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "MonthlyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalance_id_key" ON "MonthlyBalance"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_key" ON "Account"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Category_id_key" ON "Category"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_id_key" ON "Expense"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToAccount" ADD CONSTRAINT "UserToAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToAccount" ADD CONSTRAINT "UserToAccount_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBalance" ADD CONSTRAINT "MonthlyBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
