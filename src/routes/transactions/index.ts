import express, { Router } from "express";
import {
  changeTransaction,
  createTransaction,
  deleteTransaction,
  getUserTransactions,
  getTransaction,
} from "./transactions";

const expenses: Router = express.Router();

expenses.get("/", getUserTransactions);
// get transactions per account -> pass acc ID as parameter -> ?
// expenses.get("/months", getMonthTransactions);
// expenses.get("/monthly-summary", getMonthlySummary);
expenses.get("/:id", getTransaction);
expenses.post("/", createTransaction);
expenses.put("/:id", changeTransaction);
expenses.delete("/:id", deleteTransaction);

export default expenses;
