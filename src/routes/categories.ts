import express, { Response, Request } from "express";
import { Category, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { authenticateUser } from "../middleware/authentication";
import { authorize } from "../middleware/authorization";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

router.get("/", authenticateUser, async (_req: Request, res: Response) => {
  try {
    const categories = await getAllCategories();
    res.status(200).send({ response: categories });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", authenticateUser, async (req: Request, res: Response) => {
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

router.delete("/:id", authenticateUser, async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(id);

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

router.get("/:id", authenticateUser, async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
    } else {
      res.status(200).send({ response: category });
    }
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.patch("/:id", authenticateUser, async (req: Request, res: Response) => {
  const id = req.params.id;

  const { name, shortcut } = req.body;
  const category: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
    name,
    shortcut,
  };

  try {
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: category,
    });
    res.status(200).send({
      response: `Category ${updatedCategory.name} successfully updated.`,
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

export default router;
