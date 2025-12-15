import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authenticateUser } from "../middleware/authentication";
import { authorize } from "../middleware/authorization";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllExpenses = async () => {
  const expenses = await prisma.expense.findMany({
    include: {
      account: {
        select: { type: true },
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log(expenses);
  return expenses;
};

// -----

router.get("/", authenticateUser, async (_req: Request, res: Response) => {
  try {
    const expenses = await getAllExpenses();
    res.status(200).send({ response: expenses });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", authenticateUser, async (req: Request, res: Response) => {
  const { amount, accountId, categoryId, description } = req.body;

  if (!amount || !accountId || !categoryId) {
    res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newExpense = await prisma.expense.create({
      data: {
        amount,
        accountId,
        categoryId,
        description,
        shared: false,
      },
    });

    res.status(201).json({ response: newExpense });
  } catch (error) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, accountId, categoryId, description } = req.body;

  try {
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount,
        accountId,
        categoryId,
        description,
      },
    });
    res.status(200).json({ response: updatedExpense });
  } catch (error) {
    res.status(500).json({ error: "Failed to update expense" });
  }
});

router.get(
  "/monthly-summary",
  authenticateUser,
  async (req: Request, res: Response) => {
    const userId = "";
    const { year, month } = req.query;

    if (!year || !month) {
      res.status(400).json({ error: "Year and month are required" });
    }

    try {
      const result = await prisma.$queryRaw`
      SELECT
        c.id AS "categoryId",
        c.name AS "categoryName",
        SUM(e.amount) AS "totalSpent"
      FROM "Expense" e
      JOIN "Category" c ON e."categoryId" = c.id
      WHERE e."accountId" IN (
        SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
        UNION
        SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
      )
      AND EXTRACT(YEAR FROM e."createdAt") = ${parseInt(year as string, 10)}
      AND EXTRACT(MONTH FROM e."createdAt") = ${parseInt(month as string, 10)}
      GROUP BY c.id, c.name
      ORDER BY "totalSpent" DESC;
    `;

      res.status(200).json({ response: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch monthly summary" });
    }
  },
);

router.get("/months", authenticateUser, async (req: Request, res: Response) => {
  const userId = "";
  // const userId = req.user?.id;

  try {
    const result: { year: number; month: number }[] = await prisma.$queryRaw`
      SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") AS year, EXTRACT(MONTH FROM "createdAt") AS month
      FROM "Expense"
      WHERE "accountId" IN (
        SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
        UNION
        SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
      )
      ORDER BY year DESC, month DESC;
    `;

    res.status(200).json({ response: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch expense months" });
  }
});

router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid expense ID" });
  }

  try {
    await prisma.expense.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: `Expense with ID ${id} deleted successfully.` });
  } catch (error) {
    res.status(404).json({ error: "Expense not found or already deleted." });
  }
});

export default router;
