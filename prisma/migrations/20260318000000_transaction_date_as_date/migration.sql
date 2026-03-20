-- AlterTable
ALTER TABLE "Transaction"
ALTER COLUMN "transactionDate" TYPE DATE
USING "transactionDate"::date;
