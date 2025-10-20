import express, { Response, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authMiddleware, AuthRequest } from "./auth";

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

router.get("/", authMiddleware, async (_req: AuthRequest, res: Response) => {
  try {
    const expenses = await getAllExpenses();
    res.status(200).send({ response: expenses });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
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

router.patch(
  "/:id",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
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
  }
);

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
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
