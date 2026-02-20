import { prisma } from "../lib/db/prisma";
import { Prisma, PrismaClient } from "../prisma/generated/client";
import { ModifyTransactionData, TransactionData } from "../types/transaction";
import utilityServices from "./utility";

const FIXED_INCLUDE = {
  account: {
    select: { type: true },
  },
  category: {
    select: { name: true },
  },
};

async function createTransaction(data: TransactionData) {
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: data,
    });
    console.log(transaction);
    const updatedAccount = await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: {
          increment: data.amount,
        },
      },
    });
    console.log(updatedAccount);

    await updateBalanceSources(data, tx as Prisma.TransactionClient);

    return transaction;
  });
}

async function getTransaction(id: string) {
  return await prisma.transaction.findMany({
    where: { id },
    include: FIXED_INCLUDE,
  });
}
async function getAllTransactions(id: string) {
  return await prisma.transaction.findMany({
    where: { accountId: id },
    include: FIXED_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });
}
async function getMonthlyTransactions() {}
async function getMonthlySummary() {}
async function getMonthlyTransactionsPerCategory() {}

async function updateTransaction(data: ModifyTransactionData) {
  return await prisma.$transaction(async (tx) => {
    const deletedTransaction = await tx.transaction.delete({
      where: { id: data.id },
    });
    console.log(deletedTransaction);
    const transaction = await tx.transaction.create({
      data: data,
    });
    console.log(transaction);
    const updatedAccount = await tx.account.update({
      where: { id: data.accountId },
      data: {
        balance: {
          increment: data.amount.minus(deletedTransaction.amount),
        },
      },
    });
    console.log(updatedAccount);

    if (
      deletedTransaction.transactionDate.getTime() >
      data.transactionDate.getTime()
    ) {
      await updateBalanceSources(data, tx as Prisma.TransactionClient);
    } else {
      await updateBalanceSources(
        { ...data, transactionDate: deletedTransaction.transactionDate },
        tx as Prisma.TransactionClient,
      );
    }

    return transaction;
  });
}

async function deleteTransaction(id: string) {
  return await prisma.$transaction(async (tx) => {
    const deletedTransaction = await tx.transaction.delete({
      where: { id },
    });
    console.log(deletedTransaction);
    const updatedAccount = await tx.account.update({
      where: { id: deletedTransaction.accountId },
      data: {
        balance: {
          decrement: deletedTransaction.amount,
        },
      },
    });
    console.log(updatedAccount);

    await updateBalanceSources(
      deletedTransaction,
      tx as Prisma.TransactionClient,
    );
  });
}

async function updateBalanceSources(
  data: TransactionData,
  tx: Prisma.TransactionClient,
) {
  const transactionDate = new Date(
    Date.UTC(
      data.transactionDate.getFullYear(),
      data.transactionDate.getMonth(),
      data.transactionDate.getDay(),
    ),
  );
  const { month: transactionMonth, year: transactionYear } =
    utilityServices.stripDate(transactionDate);
  const startOfMonth = new Date(
    Date.UTC(transactionYear, transactionMonth - 1, 1),
  );
  const { month: startMonth, year: startYear } =
    utilityServices.stripDate(startOfMonth);

  const monthSummaries = await tx.monthlySummary.findMany({
    where: {
      accountId: data.accountId,
      OR: [
        {
          year: { gt: startYear },
        },
        {
          year: startYear,
          month: { gte: startMonth },
        },
      ],
    },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
  console.log(monthSummaries);

  const months: Date[] = [
    startOfMonth,
    ...monthSummaries.map(
      (summary) => new Date(Date.UTC(summary.year, summary.month, 1)),
    ),
  ];

  console.log(months);

  type boundariesType = {
    transactionDate: { lt: Date; gte?: Date };
    amount?: { gt?: number; lt?: number };
  };

  async function doAggregate(boundaries: boundariesType) {
    return await tx.transaction.aggregate({
      where: {
        accountId: data.accountId,
        ...boundaries,
      },
      _sum: {
        amount: true,
      },
    });
  }

  // const monthsPurified = [...new Set(months.map((m) => m.getTime()))].map(
  //   (t) => new Date(t),
  // );
  // console.log(monthsPurified);

  for (const monthStartDate of months) {
    const { month, year } = utilityServices.stripDate(monthStartDate);
    const nextMonthStartDate = new Date(Date.UTC(year, month, 1));
    const openingBoundaries = {
      transactionDate: { lt: monthStartDate },
    };
    const incomeBoundaries = {
      transactionDate: { gte: monthStartDate, lt: nextMonthStartDate },
      amount: { gt: 0 },
    };
    const expenseBoundaries = {
      transactionDate: { gte: monthStartDate, lt: nextMonthStartDate },
      amount: { lt: 0 },
    };

    const [openingBalance, totalIncome, totalExpense] = await Promise.all([
      doAggregate(openingBoundaries),
      doAggregate(incomeBoundaries),
      doAggregate(expenseBoundaries),
    ]).then((results) =>
      results.map(
        (aggregate) => aggregate._sum.amount ?? new Prisma.Decimal(0),
      ),
    );
    const closingBalance = openingBalance.plus(totalIncome).plus(totalExpense);

    console.log({
      monthStartDate,
      nextMonthStartDate,
    });

    console.log({
      openingBalance,
      totalIncome,
      totalExpense,
      closingBalance,
    });

    const summary = await tx.monthlySummary.upsert({
      where: {
        accountId_year_month: {
          accountId: data.accountId,
          year,
          month,
        },
      },
      update: {
        openingBalance,
        totalIncome,
        totalExpense,
        closingBalance,
      },
      create: {
        accountId: data.accountId,
        year,
        month,
        openingBalance,
        totalIncome,
        totalExpense,
        closingBalance,
      },
    });
    console.log(summary);

    await tx.monthlyCategorySummary.deleteMany({
      where: { monthlySummaryId: summary.id },
    });

    const categoryGroups = await tx.transaction
      .groupBy({
        by: ["categoryId"],
        where: {
          accountId: data.accountId,
          transactionDate: {
            gte: monthStartDate,
            lt: nextMonthStartDate,
          },
          categoryId: { not: undefined },
        },
        _sum: {
          amount: true,
        },
      })
      .then((results) =>
        results.map((group) => ({
          monthlySummaryId: summary.id,
          categoryId: group.categoryId!,
          totalAmount: group._sum.amount ?? new Prisma.Decimal(0),
        })),
      );

    console.log(categoryGroups);

    if (categoryGroups.length > 0) {
      await tx.monthlyCategorySummary.createMany({
        data: categoryGroups,
      });
    }
  }
}

export default {
  createTransaction,
  getAllTransactions,
  getTransaction,
  getMonthlyTransactions,
  getMonthlySummary,
  deleteTransaction,
  updateTransaction,
};

//   for (const group of categoryGroups) {
//     await tx.monthlyCategorySummary.create({
//       data: {
//         monthlySummaryId: summary.id,
//         categoryId: group.categoryId!,
//         totalAmount: group._sum.amount!,
//       },
//     });
//   }
// }
