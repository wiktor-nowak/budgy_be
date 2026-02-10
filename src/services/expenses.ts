import { prisma } from "../lib/db/prisma";
import { ExpenseData, ModifyExpenseData } from "../types/expense";

const FIXED_INCLUDE = {
  account: {
    select: { type: true },
  },
  category: {
    select: { name: true },
  },
};

async function createExpense(data: ExpenseData) {
  return await prisma.expense.create({
    data: {
      ...data,
      shared: false,
    },
  });
}
async function getExpense(id: string) {
  return await prisma.expense.findMany({
    where: { id },
    include: FIXED_INCLUDE,
  });
}
async function getAllExpenses(id: string) {
  return await prisma.expense.findMany({
    where: { accountId: id },
    include: FIXED_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });
}
async function getMonthlyExpenses() {}
async function getMonthlySummary() {}
async function getMonthlyExpensesPerCategory() {}
async function updateExpenses({
  amount,
  accountId,
  categoryId,
  description,
  id,
}: ModifyExpenseData) {
  return await prisma.expense.update({
    where: { id },
    data: { amount, accountId, categoryId, description },
  });
}

async function deleteExpense(id: string) {
  return await prisma.expense.delete({
    where: { id },
  });
}

export default {
  createExpense,
  getAllExpenses,
  getExpense,
  getMonthlyExpenses,
  getMonthlySummary,
  deleteExpense,
  updateExpenses,
};
