import express, { Response, Request } from "express";
import { Category, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.status(200).send({ response: categories });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { name, shortcut } = req.body;
  const category: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
    name,
    shortcut,
  };

  try {
    const categoryCreated = await prisma.category.create({
      data: category,
    });
    res.status(201).send({
      response: `Category ${categoryCreated.name} successfully created.`,
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    await prisma.category.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: `Category with ID ${id} deleted successfully.` });
  } catch (error) {
    res.status(404).json({ error: "Category not found or already deleted." });
  }
});

export default router;
