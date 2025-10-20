import express, { Response, Request } from "express";
import { Expense, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllExpenses = async () => {
  const expenses = await prisma.expense.findMany();
  return expenses;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const expenses = await getAllExpenses();
    res.status(200).send({ response: expenses });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { amount, shared, accountId, categoryId } = req.body;
  const expense: Omit<Expense, "id" | "createdAt" | "updatedAt"> = {
    amount,
    shared,
    accountId,
    categoryId,
  };

  try {
    await prisma.expense.create({
      data: expense,
    });
    res.status(201).send({
      response: `Expense added!`,
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

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
