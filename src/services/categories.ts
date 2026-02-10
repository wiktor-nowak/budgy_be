import { prisma } from "../lib/db/prisma";
import { CategoryData, UpdateCategoryData } from "../types/category";

async function createCategory(category: CategoryData) {
  return await prisma.category.create({
    data: category,
  });
}
async function getCategory(id: string) {
  return await prisma.category.findUnique({
    where: { id },
  });
}
async function getAllCategories(accId: string) {
  return await prisma.category.findMany({
    where: { accountId: accId },
  });
}
async function updateCategory({ id, shortcut, name }: UpdateCategoryData) {
  return await prisma.category.update({
    where: { id },
    data: {
      shortcut,
      name,
    },
  });
}
async function deleteCategory(id: string) {
  return await prisma.category.delete({
    where: { id },
  });
}

export default {
  createCategory,
  getAllCategories,
  getCategory,
  deleteCategory,
  updateCategory,
};
