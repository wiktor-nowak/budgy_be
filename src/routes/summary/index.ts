import express, { Router } from "express";
import {
  getAccountBalances,
  getAccountsMonthlyCashflow,
  getAccountsMonthlyClosingBalances,
  getLatestMainAccountCategoryBreakdown,
  getMonthlySummaries,
  getMonthlySummary,
} from "./summary";

const summary: Router = express.Router();

summary.get("/monthly", getMonthlySummaries);
summary.get("/monthly/:id", getMonthlySummary);
summary.get(
  "/main-account/latest-category-breakdown",
  getLatestMainAccountCategoryBreakdown,
);
summary.get("/accounts/balances", getAccountBalances);
summary.get("/accounts/monthly-cashflow", getAccountsMonthlyCashflow);
summary.get(
  "/accounts/monthly-closing-balances",
  getAccountsMonthlyClosingBalances,
);

export default summary;
