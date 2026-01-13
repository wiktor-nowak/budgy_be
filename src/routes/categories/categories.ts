import express, { Response, Request, NextFunction } from "express";
import { Category, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).send({ response: categories });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
};

export const editCategory = async (req: Request, res: Response) => {
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
};
