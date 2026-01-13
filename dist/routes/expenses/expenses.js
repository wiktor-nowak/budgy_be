"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.changeExpense = exports.createExpense = exports.getMonthlySummary = exports.getMonthExpenses = exports.getAllExpenses = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllExpenses = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield yield prisma.expense.findMany({
            include: {
                account: {
                    select: { type: true },
                },
                category: {
                    select: { name: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).send({ response: expenses });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getAllExpenses = getAllExpenses;
const getMonthExpenses = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = "";
    // const userId = req.user?.id;
    try {
        const result = yield prisma.$queryRaw `
      SELECT DISTINCT EXTRACT(YEAR FROM "createdAt") AS year, EXTRACT(MONTH FROM "createdAt") AS month
      FROM "Expense"
      WHERE "accountId" IN (
        SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
        UNION
        SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
      )
      ORDER BY year DESC, month DESC;
    `;
        res.status(200).json({ response: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch expense months" });
    }
});
exports.getMonthExpenses = getMonthExpenses;
const getMonthlySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = "";
    const { year, month } = req.query;
    if (!year || !month) {
        res.status(400).json({ error: "Year and month are required" });
    }
    try {
        const result = yield prisma.$queryRaw `
      SELECT
        c.id AS "categoryId",
        c.name AS "categoryName",
        SUM(e.amount) AS "totalSpent"
      FROM "Expense" e
      JOIN "Category" c ON e."categoryId" = c.id
      WHERE e."accountId" IN (
        SELECT "id" FROM "Account" WHERE "ownerId" = ${userId}
        UNION
        SELECT "accountId" FROM "UserToAccount" WHERE "userId" = ${userId}
      )
      AND EXTRACT(YEAR FROM e."createdAt") = ${parseInt(year, 10)}
      AND EXTRACT(MONTH FROM e."createdAt") = ${parseInt(month, 10)}
      GROUP BY c.id, c.name
      ORDER BY "totalSpent" DESC;
    `;
        res.status(200).json({ response: result });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch monthly summary" });
    }
});
exports.getMonthlySummary = getMonthlySummary;
const createExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, accountId, categoryId, description } = req.body;
    if (!amount || !accountId || !categoryId) {
        res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const newExpense = yield prisma.expense.create({
            data: {
                amount,
                accountId,
                categoryId,
                description,
                shared: false,
            },
        });
        res.status(201).json({ response: newExpense });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create expense" });
    }
});
exports.createExpense = createExpense;
const changeExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { amount, accountId, categoryId, description } = req.body;
    try {
        const updatedExpense = yield prisma.expense.update({
            where: { id },
            data: {
                amount,
                accountId,
                categoryId,
                description,
            },
        });
        res.status(200).json({ response: updatedExpense });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update expense" });
    }
});
exports.changeExpense = changeExpense;
const deleteExpense = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid expense ID" });
    }
    try {
        yield prisma.expense.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Expense with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Expense not found or already deleted." });
    }
});
exports.deleteExpense = deleteExpense;
