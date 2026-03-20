import { Transaction } from "../prisma/generated/client";

export type NormalizedTransactionData = Pick<
  Transaction,
  "amount" | "categoryId" | "accountId" | "description" | "transactionDate"
>;

export type TransactionInputData = Omit<
  NormalizedTransactionData,
  "transactionDate"
> & {
  transactionDate: string;
};
