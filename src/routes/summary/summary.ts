import { Request, Response } from "express";
import summaryService from "../../services/summary";

function parsePositiveInteger(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

export async function getMonthlySummaries(req: Request, res: Response) {
  const summaries = await summaryService.getMonthlySummaries(req.auth.id, {
    accountId:
      typeof req.query.accountId === "string" ? req.query.accountId : undefined,
    year: parsePositiveInteger(req.query.year),
    month: parsePositiveInteger(req.query.month),
    limit: parsePositiveInteger(req.query.limit),
  });

  res.status(200).send({ response: summaries });
}

export async function getMonthlySummary(req: Request, res: Response) {
  const summary = await summaryService.getMonthlySummary(
    req.auth.id,
    req.params.id as string,
  );

  res.status(200).send({ response: summary });
}

export async function getLatestMainAccountCategoryBreakdown(
  req: Request,
  res: Response,
) {
  const summary = await summaryService.getLatestMainAccountCategoryBreakdown(
    req.auth.id,
  );

  res.status(200).send({ response: summary });
}

export async function getAccountBalances(req: Request, res: Response) {
  const limit = parsePositiveInteger(req.query.limit) ?? 5;
  const balances = await summaryService.getAccountBalances(req.auth.id, limit);

  res.status(200).send({ response: balances });
}

export async function getAccountsMonthlyCashflow(req: Request, res: Response) {
  const cashflow = await summaryService.getAccountsMonthlyCashflow(
    req.auth.id,
    parsePositiveInteger(req.query.limit),
  );

  res.status(200).send({ response: cashflow });
}

export async function getAccountsMonthlyClosingBalances(
  req: Request,
  res: Response,
) {
  const balances = await summaryService.getAccountsMonthlyClosingBalances(
    req.auth.id,
    parsePositiveInteger(req.query.limit),
  );

  res.status(200).send({ response: balances });
}
