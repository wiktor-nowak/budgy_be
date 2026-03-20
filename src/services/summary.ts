import { prisma } from "../lib/db/prisma";
import ResourceNotFoundError from "../errors/ResourceNotFoundError";
import {
  AccountBalanceDto,
  CategoryBreakdownDto,
  MonthlyCashflowDto,
  MonthlyClosingBalanceDto,
  MonthlySummaryDto,
} from "../types/summary";

type MonthlySummaryFilters = {
  accountId?: string;
  year?: number;
  month?: number;
  limit?: number;
};

function buildMonthLabel(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function toNumber(value: { toNumber(): number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}

async function getVisibleAccounts(userId: string) {
  const sharedAccountLinks = await prisma.userToAccount.findMany({
    where: { userId },
    select: { accountId: true },
  });
  const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);

  return prisma.account.findMany({
    where: {
      OR: [{ ownerId: userId }, { id: { in: sharedAccountIds } }],
    },
    select: {
      id: true,
      name: true,
      balance: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

function mapMonthlySummary(
  summary: {
    id: string;
    year: number;
    month: number;
    openingBalance: { toNumber(): number };
    totalIncome: { toNumber(): number };
    totalExpense: { toNumber(): number };
    closingBalance: { toNumber(): number };
    accountId: string;
    account: { name: string };
    categorySummaries: Array<{
      totalAmount: { toNumber(): number };
      categoryId: string;
      category: { name: string };
    }>;
  },
): MonthlySummaryDto {
  return {
    id: summary.id,
    accountId: summary.accountId,
    accountName: summary.account.name,
    year: summary.year,
    month: summary.month,
    openingBalance: summary.openingBalance.toNumber(),
    totalIncome: summary.totalIncome.toNumber(),
    totalExpense: summary.totalExpense.toNumber(),
    totalSpent: Math.abs(summary.totalExpense.toNumber()),
    closingBalance: summary.closingBalance.toNumber(),
    categorySummaries: summary.categorySummaries
      .map((categorySummary) => {
        const totalAmount = categorySummary.totalAmount.toNumber();

        return {
          categoryId: categorySummary.categoryId,
          categoryName: categorySummary.category.name,
          totalAmount,
          totalSpent: totalAmount < 0 ? Math.abs(totalAmount) : 0,
        };
      })
      .sort((left, right) => right.totalSpent - left.totalSpent),
  };
}

async function getMonthlySummaries(userId: string, filters: MonthlySummaryFilters) {
  const visibleAccounts = await getVisibleAccounts(userId);
  const visibleAccountIds = visibleAccounts.map((account) => account.id);
  if (visibleAccountIds.length === 0) {
    return [];
  }

  const accountFilter =
    filters.accountId && visibleAccountIds.includes(filters.accountId)
      ? filters.accountId
      : undefined;

  const summaries = await prisma.monthlySummary.findMany({
    where: {
      accountId: accountFilter
        ? accountFilter
        : {
            in: visibleAccountIds,
          },
      ...(filters.year ? { year: filters.year } : {}),
      ...(filters.month ? { month: filters.month } : {}),
    },
    include: {
      account: {
        select: {
          name: true,
        },
      },
      categorySummaries: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }, { account: { name: "asc" } }],
    ...(filters.limit ? { take: filters.limit } : {}),
  });

  return summaries.map(mapMonthlySummary);
}

async function getMonthlySummary(userId: string, id: string) {
  const visibleAccounts = await getVisibleAccounts(userId);
  const visibleAccountIds = visibleAccounts.map((account) => account.id);

  const summary = await prisma.monthlySummary.findUnique({
    where: { id },
    include: {
      account: {
        select: {
          name: true,
        },
      },
      categorySummaries: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!summary || !visibleAccountIds.includes(summary.accountId)) {
    throw new ResourceNotFoundError("Monthly summary not found.");
  }

  return mapMonthlySummary(summary);
}

async function getLatestMainAccountCategoryBreakdown(
  userId: string,
): Promise<CategoryBreakdownDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mainAccountId: true,
    },
  });

  if (!user?.mainAccountId) {
    throw new ResourceNotFoundError("No main account assigned.");
  }

  const summary = await prisma.monthlySummary.findFirst({
    where: {
      accountId: user.mainAccountId,
    },
    include: {
      account: {
        select: {
          name: true,
        },
      },
      categorySummaries: {
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  if (!summary) {
    throw new ResourceNotFoundError("No monthly summary found for main account.");
  }

  const mappedSummary = mapMonthlySummary(summary);

  return {
    accountId: mappedSummary.accountId,
    accountName: mappedSummary.accountName,
    year: mappedSummary.year,
    month: mappedSummary.month,
    categories: mappedSummary.categorySummaries.filter(
      (category) => category.totalSpent > 0,
    ),
  };
}

async function getAccountBalances(
  userId: string,
  limit = 5,
): Promise<AccountBalanceDto[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      mainAccountId: true,
    },
  });

  const visibleAccounts = await getVisibleAccounts(userId);

  return visibleAccounts
    .sort((left, right) => {
      if (left.id === user?.mainAccountId) return -1;
      if (right.id === user?.mainAccountId) return 1;
      return left.name.localeCompare(right.name);
    })
    .slice(0, limit)
    .map((account) => ({
      accountId: account.id,
      accountName: account.name,
      balance: toNumber(account.balance),
    }));
}

async function getAccountsMonthlyCashflow(
  userId: string,
  limit?: number,
): Promise<MonthlyCashflowDto[]> {
  const summaries = await getMonthlySummaries(userId, {
    limit,
  });

  return summaries
    .map((summary) => ({
      accountId: summary.accountId,
      accountName: summary.accountName,
      year: summary.year,
      month: summary.month,
      label: buildMonthLabel(summary.year, summary.month),
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      totalSpent: summary.totalSpent,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

async function getAccountsMonthlyClosingBalances(
  userId: string,
  limit?: number,
): Promise<MonthlyClosingBalanceDto[]> {
  const summaries = await getMonthlySummaries(userId, {
    limit,
  });

  return summaries
    .map((summary) => ({
      accountId: summary.accountId,
      accountName: summary.accountName,
      year: summary.year,
      month: summary.month,
      label: buildMonthLabel(summary.year, summary.month),
      closingBalance: summary.closingBalance,
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
}

export default {
  getAccountBalances,
  getAccountsMonthlyCashflow,
  getAccountsMonthlyClosingBalances,
  getLatestMainAccountCategoryBreakdown,
  getMonthlySummaries,
  getMonthlySummary,
};
