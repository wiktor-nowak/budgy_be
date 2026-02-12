import express, { Router } from "express";
import {
  changeExpense,
  createExpense,
  deleteExpense,
  getAllExpenses,
  getExpense,
} from "./expenses";

const expenses: Router = express.Router();

expenses.get("/", getAllExpenses);
// expenses.get("/months", getMonthExpenses);
// expenses.get("/monthly-summary", getMonthlySummary);
expenses.get("/:id", getExpense);
expenses.post("/", createExpense);
expenses.patch("/:id", changeExpense);
expenses.delete("/:id", deleteExpense);

export default expenses;
