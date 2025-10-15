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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllExpenses = () => __awaiter(void 0, void 0, void 0, function* () {
    const expenses = yield prisma.expense.findMany();
    return expenses;
});
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const expenses = yield getAllExpenses();
        res.status(200).send({ response: expenses });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, shared, accountId, categoryId } = req.body;
    const expense = {
        amount,
        shared,
        accountId,
        categoryId,
    };
    try {
        yield prisma.expense.create({
            data: expense,
        });
        res.status(201).send({
            response: `Expense added!`,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid expense ID" });
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
}));
exports.default = router;
