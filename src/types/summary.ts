export interface MonthlyCategorySummaryDto {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  totalSpent: number;
}

export interface MonthlySummaryDto {
  id: string;
  accountId: string;
  accountName: string;
  year: number;
  month: number;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  totalSpent: number;
  closingBalance: number;
  categorySummaries: MonthlyCategorySummaryDto[];
}

export interface CategoryBreakdownDto {
  accountId: string;
  accountName: string;
  year: number;
  month: number;
  categories: MonthlyCategorySummaryDto[];
}

export interface AccountBalanceDto {
  accountId: string;
  accountName: string;
  balance: number;
}

export interface MonthlyCashflowDto {
  accountId: string;
  accountName: string;
  year: number;
  month: number;
  label: string;
  totalIncome: number;
  totalExpense: number;
  totalSpent: number;
}

export interface MonthlyClosingBalanceDto {
  accountId: string;
  accountName: string;
  year: number;
  month: number;
  label: string;
  closingBalance: number;
}
