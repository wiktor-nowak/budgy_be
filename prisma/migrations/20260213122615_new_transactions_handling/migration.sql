/*
  Warnings:

  - You are about to drop the column `lastMonthlyBalance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MonthlyBalance` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountId,shortcut]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "MonthlyBalance" DROP CONSTRAINT "MonthlyBalance_accountId_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "lastMonthlyBalance",
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(14,2);

-- DropTable
DROP TABLE "Expense";

-- DropTable
DROP TABLE "MonthlyBalance";

-- DropEnum
DROP TYPE "Month";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transactionDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySummary" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "openingBalance" DECIMAL(14,2) NOT NULL,
    "totalIncome" DECIMAL(14,2) NOT NULL,
    "totalExpense" DECIMAL(14,2) NOT NULL,
    "closingBalance" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" UUID NOT NULL,

    CONSTRAINT "MonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyCategorySummary" (
    "id" UUID NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "monthlySummaryId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,

    CONSTRAINT "MonthlyCategorySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_accountId_transactionDate_idx" ON "Transaction"("accountId", "transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_accountId_categoryId_idx" ON "Transaction"("accountId", "categoryId");

-- CreateIndex
CREATE INDEX "MonthlySummary_accountId_idx" ON "MonthlySummary"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySummary_accountId_year_month_key" ON "MonthlySummary"("accountId", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCategorySummary_monthlySummaryId_categoryId_key" ON "MonthlyCategorySummary"("monthlySummaryId", "categoryId");

-- CreateIndex
CREATE INDEX "Account_ownerId_idx" ON "Account"("ownerId");

-- CreateIndex
CREATE INDEX "Category_accountId_idx" ON "Category"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_accountId_shortcut_key" ON "Category"("accountId", "shortcut");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySummary" ADD CONSTRAINT "MonthlySummary_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyCategorySummary" ADD CONSTRAINT "MonthlyCategorySummary_monthlySummaryId_fkey" FOREIGN KEY ("monthlySummaryId") REFERENCES "MonthlySummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyCategorySummary" ADD CONSTRAINT "MonthlyCategorySummary_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
