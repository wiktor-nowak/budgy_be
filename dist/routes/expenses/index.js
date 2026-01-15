"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const expenses_1 = require("./expenses");
const expenses = express_1.default.Router();
expenses.get("/", authentication_1.authMiddleware, expenses_1.getAllExpenses);
// expenses.get("/:id", authMiddleware, getExpense);
expenses.get("/months", authentication_1.authMiddleware, expenses_1.getMonthExpenses);
expenses.get("/monthly-summary", authentication_1.authMiddleware, expenses_1.getMonthlySummary);
expenses.post("/", expenses_1.createExpense);
expenses.patch("/:id", authentication_1.authMiddleware, expenses_1.changeExpense);
expenses.delete("/:id", authentication_1.authMiddleware, expenses_1.deleteExpense);
exports.default = expenses;
