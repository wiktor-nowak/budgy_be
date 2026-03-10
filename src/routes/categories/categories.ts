import { Response, Request } from "express";
import categoriesServices from "../../services/categories";

export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await categoriesServices.getAllCategories(req.body?.accId);
  res.status(200).send({ response: categories });
};

export const createCategory = async (req: Request, res: Response) => {
  const category = await categoriesServices.createCategory(req.body);
  res.status(201).location(`/categories/${category.id}`);
};

export const getCategory = async (req: Request, res: Response) => {
  const category = await categoriesServices.getCategory(req.body?.id);
  res.status(200).send({ response: category });
};

export const deleteCategory = async (req: Request, res: Response) => {
  await categoriesServices.deleteCategory(req.body?.id);
  res.status(204);
};

export const editCategory = async (req: Request, res: Response) => {
  await categoriesServices.updateCategory(req.body);
  res.status(204);
};
