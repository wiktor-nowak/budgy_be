import { Response, Request } from "express";
import transactionsServices from "../../services/transactions";

export async function getAccountTransactions(req: Request, res: Response) {
  const transactions = await transactionsServices.getAccountTransactions(
    req.body.accountId,
  );
  res.status(200).send({ response: transactions });
}

export async function getUserTransactions(req: Request, res: Response) {
  const transactions = await transactionsServices.getUserTransactions(
    req.auth.id,
  );
  res.status(200).send({ response: transactions });
}

// async function getMonthTransactions(req: Request, res: Response) {
//   const userId = "";
//   // const userId = req.user?.id;

//   try {
//     const result: { year: number; month: number }[] = await prisma.$queryRaw`
//       SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") AS year, EXTRACT(MONTH FROM "createdAt") AS month
//       FROM "Transaction"
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
//     res.status(500).json({ error: "Failed to fetch transaction months" });
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
//       FROM "Transaction" e
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

export async function createTransaction(req: Request, res: Response) {
  const transaction = await transactionsServices.createTransaction(req.body);
  res
    .status(201)
    .location(`/transaction/${transaction.id}`)
    .send({ response: transaction });
}

export async function changeTransaction(req: Request, res: Response) {
  await transactionsServices.updateTransaction(req.body);
  res.status(204);
  // possibly 200 with body of new transaction?
}

export async function getTransaction(req: Request, res: Response) {
  const transaction = await transactionsServices.getTransaction(req.body.id);
  res.status(200).send({ response: transaction });
}

export async function deleteTransaction(req: Request, res: Response) {
  await transactionsServices.deleteTransaction(req.body?.id);
  res.status(204);
}
