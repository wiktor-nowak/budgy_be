"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.changeExpense = exports.createExpense = exports.getMonthlySummary = exports.getMonthExpenses = exports.getAllExpenses = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllExpenses = async (_req, res) => {
    try {
        const expenses = await await prisma_1.prisma.expense.findMany({
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
};
exports.getAllExpenses = getAllExpenses;
const getMonthExpenses = async (req, res) => {
    const userId = "";
    // const userId = req.user?.id;
    try {
        const result = await prisma_1.prisma.$queryRaw `
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
};
exports.getMonthExpenses = getMonthExpenses;
const getMonthlySummary = async (req, res) => {
    const userId = "";
    const { year, month } = req.query;
    if (!year || !month) {
        res.status(400).json({ error: "Year and month are required" });
    }
    try {
        const result = await prisma_1.prisma.$queryRaw `
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
};
exports.getMonthlySummary = getMonthlySummary;
const createExpense = async (req, res) => {
    const { amount, accountId, categoryId, description } = req.body;
    if (!amount || !accountId || !categoryId) {
        res.status(400).json({ error: "Missing required fields" });
    }
    try {
        const newExpense = await prisma_1.prisma.expense.create({
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
};
exports.createExpense = createExpense;
const changeExpense = async (req, res) => {
    const { amount, accountId, categoryId, description } = req.body;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const updatedExpense = await prisma_1.prisma.expense.update({
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
};
exports.changeExpense = changeExpense;
const deleteExpense = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid expense ID" });
    }
    try {
        await prisma_1.prisma.expense.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Expense with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Expense not found or already deleted." });
    }
};
exports.deleteExpense = deleteExpense;
