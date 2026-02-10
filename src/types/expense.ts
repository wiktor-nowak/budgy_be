import { Expense } from "../prisma/generated/client";

export type ExpenseData = Pick<
  Expense,
  "amount" | "categoryId" | "accountId" | "description"
>;

export type ModifyExpenseData = Pick<
  Expense,
  "amount" | "categoryId" | "accountId" | "description" | "id"
>;
