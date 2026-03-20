import { prisma } from "../lib/db/prisma";
import { Prisma } from "../prisma/generated/client";
import {
  NormalizedTransactionData,
  TransactionInputData,
} from "../types/transaction";
import utilityServices from "./utility";
import ResourceNotFoundError from "../errors/ResourceNotFoundError";

const FIXED_INCLUDE = {
  account: {
    select: { name: true },
  },
  category: {
    select: { name: true },
  },
};

function getMonthStartDate(date: Date) {
  const { month, year } = utilityServices.stripDate(date);
  return new Date(Date.UTC(year, month - 1, 1));
}

function getNextMonthStartDate(date: Date) {
  const { month, year } = utilityServices.stripDate(date);
  return new Date(Date.UTC(year, month, 1));
}

function getMonthKey(date: Date) {
  const { month, year } = utilityServices.stripDate(date);
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseTransactionDate(date: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new Error("Invalid transaction date format.");
  }

  const [, yearString, monthString, dayString] = match;
  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);
  const day = Number.parseInt(dayString, 10);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() + 1 !== month ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error("Invalid transaction date value.");
  }

  return parsedDate;
}

function normalizeTransactionData(
  data: TransactionInputData,
): NormalizedTransactionData {
  return {
    ...data,
    transactionDate: parseTransactionDate(data.transactionDate),
  };
}

async function createTransaction(data: TransactionInputData) {
  return await prisma.$transaction(async (tx) => {
    const transactionData = normalizeTransactionData(data);
    const transaction = await tx.transaction.create({
      data: transactionData,
    });
    const acc = await tx.account.update({
      where: { id: transactionData.accountId },
      data: {
        balance: {
          increment: transactionData.amount,
        },
      },
    });

    // console.log(transactionData);
    // console.log(transaction);

    await updateBalanceSources(
      transactionData.accountId,
      transactionData.transactionDate,
      tx as Prisma.TransactionClient,
    );

    return transaction;
  });
}

async function getTransaction(id: string) {
  return await prisma.transaction.findUnique({
    where: { id },
    include: FIXED_INCLUDE,
  });
}
async function getUserTransactions(id: string) {
  const sharedAccountLinks = await prisma.userToAccount.findMany({
    where: { userId: id },
    select: { accountId: true },
  });
  const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);
  const accounts = await prisma.account.findMany({
    where: {
      OR: [{ ownerId: id }, { id: { in: sharedAccountIds } }],
    },
  });
  if (!accounts)
    throw new ResourceNotFoundError("No accounts assigned to this user.");
  const accountIds = accounts.map((acc) => acc.id);

  const transactions = await prisma.transaction.findMany({
    where: { accountId: { in: accountIds } },
    include: FIXED_INCLUDE,
    orderBy: {
      createdAt: "desc",
    },
  });

  return transactions.map((transaction) => ({
    accountId: transaction.accountId,
    accountName: transaction.account.name,
    category: transaction.category.name,
    id: transaction.id,
    amount: transaction.amount,
    transactionDate: transaction.transactionDate,
    description: transaction.description,
  }));
}

async function getAccountTransactions(id: string) {
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

async function updateTransaction(data: TransactionInputData, id: string) {
  const modifyTransactionData = normalizeTransactionData(data);
  return await prisma.$transaction(async (tx) => {
    const deletedTransaction = await tx.transaction.delete({
      where: { id },
    });
    // console.log(deletedTransaction);
    const transaction = await tx.transaction.create({
      data: modifyTransactionData,
    });
    // console.log(transaction);

    const newAmount = new Prisma.Decimal(modifyTransactionData.amount);
    const oldAmount = deletedTransaction.amount;

    const sameAccount =
      deletedTransaction.accountId === modifyTransactionData.accountId;

    if (sameAccount) {
      const diff = newAmount.minus(oldAmount);
      const updatedAccount = await tx.account.update({
        where: { id: modifyTransactionData.accountId },
        data: {
          balance: {
            increment: diff.toNumber(),
          },
        },
      });
      // console.log(updatedAccount);
    } else {
      await tx.account.update({
        where: { id: deletedTransaction.accountId },
        data: {
          balance: {
            decrement: oldAmount.toNumber(),
          },
        },
      });
      await tx.account.update({
        where: { id: modifyTransactionData.accountId },
        data: {
          balance: {
            increment: newAmount.toNumber(),
          },
        },
      });
    }

    const transactionClient = tx as Prisma.TransactionClient;
    const deletedTransactionMonthStart = getMonthStartDate(
      deletedTransaction.transactionDate,
    );
    const modifiedTransactionMonthStart = getMonthStartDate(
      modifyTransactionData.transactionDate,
    );

    if (deletedTransaction.accountId === modifyTransactionData.accountId) {
      const startDate =
        deletedTransactionMonthStart.getTime() <
        modifiedTransactionMonthStart.getTime()
          ? deletedTransactionMonthStart
          : modifiedTransactionMonthStart;

      await updateBalanceSources(
        modifyTransactionData.accountId,
        startDate,
        transactionClient,
      );
    } else {
      await updateBalanceSources(
        deletedTransaction.accountId,
        deletedTransactionMonthStart,
        transactionClient,
      );
      await updateBalanceSources(
        modifyTransactionData.accountId,
        modifiedTransactionMonthStart,
        transactionClient,
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
    // console.log(deletedTransaction);
    const updatedAccount = await tx.account.update({
      where: { id: deletedTransaction.accountId },
      data: {
        balance: {
          decrement: deletedTransaction.amount,
        },
      },
    });
    // console.log(updatedAccount);

    await updateBalanceSources(
      deletedTransaction.accountId,
      deletedTransaction.transactionDate,
      tx as Prisma.TransactionClient,
    );
  });
}

async function getAffectedMonthStarts(
  accountId: string,
  startDate: Date,
  tx: Prisma.TransactionClient,
) {
  const startOfMonth = getMonthStartDate(startDate);

  const [monthSummaries, transactions] = await Promise.all([
    tx.monthlySummary.findMany({
      where: {
        accountId,
        OR: [
          {
            year: { gt: startOfMonth.getUTCFullYear() },
          },
          {
            year: startOfMonth.getUTCFullYear(),
            month: { gte: startOfMonth.getUTCMonth() + 1 },
          },
        ],
      },
      orderBy: [{ year: "asc" }, { month: "asc" }],
      select: {
        year: true,
        month: true,
      },
    }),
    tx.transaction.findMany({
      where: {
        accountId,
        transactionDate: {
          gte: startOfMonth,
        },
      },
      select: {
        transactionDate: true,
      },
      orderBy: {
        transactionDate: "asc",
      },
    }),
  ]);

  const affectedMonths = new Map<string, Date>();
  affectedMonths.set(getMonthKey(startOfMonth), startOfMonth);

  for (const summary of monthSummaries) {
    const summaryMonthStart = new Date(
      Date.UTC(summary.year, summary.month - 1, 1),
    );
    affectedMonths.set(getMonthKey(summaryMonthStart), summaryMonthStart);
  }

  for (const transaction of transactions) {
    const transactionMonthStart = getMonthStartDate(transaction.transactionDate);
    affectedMonths.set(getMonthKey(transactionMonthStart), transactionMonthStart);
  }

  return [...affectedMonths.values()].sort(
    (left, right) => left.getTime() - right.getTime(),
  );
}

async function rebuildMonthSummary(
  accountId: string,
  monthStartDate: Date,
  tx: Prisma.TransactionClient,
) {
  const { month, year } = utilityServices.stripDate(monthStartDate);
  const nextMonthStartDate = getNextMonthStartDate(monthStartDate);
  const existingSummary = await tx.monthlySummary.findUnique({
    where: {
      accountId_year_month: {
        accountId,
        year,
        month,
      },
    },
    select: {
      id: true,
    },
  });

  const transactionCount = await tx.transaction.count({
    where: {
      accountId,
      transactionDate: {
        gte: monthStartDate,
        lt: nextMonthStartDate,
      },
    },
  });

  if (transactionCount === 0) {
    if (!existingSummary) {
      return;
    }

    await tx.monthlyCategorySummary.deleteMany({
      where: { monthlySummaryId: existingSummary.id },
    });
    await tx.monthlySummary.delete({
      where: { id: existingSummary.id },
    });
    return;
  }

  type boundariesType = {
    transactionDate: { lt: Date; gte?: Date };
    amount?: { gt?: number; lt?: number };
  };

  async function doAggregate(boundaries: boundariesType) {
    return await tx.transaction.aggregate({
      where: {
        accountId,
        ...boundaries,
      },
      _sum: {
        amount: true,
      },
    });
  }

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
    results.map((aggregate) => aggregate._sum.amount ?? new Prisma.Decimal(0)),
  );
  const closingBalance = openingBalance.plus(totalIncome).plus(totalExpense);

  const summary = await tx.monthlySummary.upsert({
    where: {
      accountId_year_month: {
        accountId,
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
      accountId,
      year,
      month,
      openingBalance,
      totalIncome,
      totalExpense,
      closingBalance,
    },
  });

  await tx.monthlyCategorySummary.deleteMany({
    where: { monthlySummaryId: summary.id },
  });

  const categoryGroups = await tx.transaction
    .groupBy({
      by: ["categoryId"],
      where: {
        accountId,
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

  if (categoryGroups.length > 0) {
    await tx.monthlyCategorySummary.createMany({
      data: categoryGroups,
    });
  }
}

async function updateBalanceSources(
  accountId: string,
  startDate: Date,
  tx: Prisma.TransactionClient,
) {
  const months = await getAffectedMonthStarts(accountId, startDate, tx);

  for (const monthStartDate of months) {
    await rebuildMonthSummary(accountId, monthStartDate, tx);
  }
}

export default {
  createTransaction,
  getUserTransactions,
  getTransaction,
  getMonthlyTransactions,
  getMonthlySummary,
  deleteTransaction,
  updateTransaction,
  getAccountTransactions,
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
