import express, { Router } from "express";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
  getCategory,
} from "./categories";

const categrories: Router = express.Router();

categrories.get("/", getAllCategories);
categrories.post("/", addCategory);
categrories.get("/:id", getCategory);
categrories.delete("/:id", deleteCategory);
categrories.patch("/:id", editCategory);

export default categrories;
