import express, { Router } from "express";
import {
  changeTransaction,
  createTransaction,
  deleteTransaction,
  getAllTransactions,
  getTransaction,
} from "./transactions";

const expenses: Router = express.Router();

expenses.get("/", getAllTransactions);
// expenses.get("/months", getMonthTransactions);
// expenses.get("/monthly-summary", getMonthlySummary);
expenses.get("/:id", getTransaction);
expenses.post("/", createTransaction);
expenses.put("/:id", changeTransaction);
expenses.delete("/:id", deleteTransaction);

export default expenses;
