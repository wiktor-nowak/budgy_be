import { Transaction } from "../prisma/generated/client";

export type TransactionData = Pick<
  Transaction,
  "amount" | "categoryId" | "accountId" | "description" | "transactionDate"
>;

export type ModifyTransactionData = Pick<
  Transaction,
  | "amount"
  | "categoryId"
  | "accountId"
  | "description"
  | "transactionDate"
  | "id"
>;

// {
//     description: "zzzz";
//     accountId: "11916aa8-2d9d-4991-8796-ea6fccd67f0b";
//     amount: 100;
//     transactionDate: new Date("2026-01-12 16:05:43.162");
//     categoryId: "3e6922d3-5758-4001-9984-283d19736c05";
// }
