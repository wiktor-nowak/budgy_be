import express, { Router } from "express";
import {
  createCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
  getCategory,
} from "./categories";

const categrories: Router = express.Router();

categrories.get("/", getAllCategories);
categrories.post("/", createCategory);
categrories.get("/:id", getCategory);
categrories.delete("/:id", deleteCategory);
categrories.patch("/:id", editCategory);

export default categrories;
