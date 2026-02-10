import { Response, Request } from "express";
import { prisma } from "../../lib/db/prisma";
import expensesServices from "../../services/expenses";

export async function getAllExpenses(req: Request, res: Response) {
  const expenses = await expensesServices.getAllExpenses(req.body.accountId);
  res.status(200).send({ response: expenses });
}

// async function getMonthExpenses(req: Request, res: Response) {
//   const userId = "";
//   // const userId = req.user?.id;

//   try {
//     const result: { year: number; month: number }[] = await prisma.$queryRaw`
//       SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") AS year, EXTRACT(MONTH FROM "createdAt") AS month
//       FROM "Expense"
//       WHERE "accountId" IN (
//         SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
//         UNION
//         SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
//       )
//       ORDER BY year DESC, month DESC;
//     `;

//     res.status(200).json({ response: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch expense months" });
//   }
// }

// async function getMonthlySummary(req: Request, res: Response) {
//   const userId = "";
//   const { year, month } = req.query;

//   if (!year || !month) {
//     res.status(400).json({ error: "Year and month are required" });
//   }

//   try {
//     const result = await prisma.$queryRaw`
//       SELECT
//         c.id AS "categoryId",
//         c.name AS "categoryName",
//         SUM(e.amount) AS "totalSpent"
//       FROM "Expense" e
//       JOIN "Category" c ON e."categoryId" = c.id
//       WHERE e."accountId" IN (
//         SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
//         UNION
//         SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
//       )
//       AND EXTRACT(YEAR FROM e."createdAt") = ${parseInt(year as string, 10)}
//       AND EXTRACT(MONTH FROM e."createdAt") = ${parseInt(month as string, 10)}
//       GROUP BY c.id, c.name
//       ORDER BY "totalSpent" DESC;
//     `;

//     res.status(200).json({ response: result });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch monthly summary" });
//   }
// }

export async function createExpense(req: Request, res: Response) {
  const expense = await expensesServices.createExpense(req.body);
  res.status(201).location(`/expense/${expense.id}`);
}

export async function changeExpense(req: Request, res: Response) {
  await expensesServices.updateExpenses(req.body);
  res.status(204);
}

export async function getExpense(req: Request, res: Response) {
  const expense = await expensesServices.getExpense(req.body.id);
  res.status(200).send({ response: expense });
}

export async function deleteExpense(req: Request, res: Response) {
  await expensesServices.deleteExpense(req.body?.id);
  res.status(204);
}
