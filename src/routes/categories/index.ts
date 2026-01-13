import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
  getCategory,
} from "./categories";

const categrories: Router = express.Router();

categrories.get("/", authMiddleware, getAllCategories);
categrories.post("/", authMiddleware, addCategory);
categrories.get("/:id", authMiddleware, getCategory);
categrories.delete("/:id", authMiddleware, deleteCategory);
categrories.patch("/:id", authMiddleware, editCategory);

export default categrories;
