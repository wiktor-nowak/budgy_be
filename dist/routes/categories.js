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
const getAllCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const categories = yield prisma.category.findMany();
    return categories;
});
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield getAllCategories();
        res.status(200).send({ response: categories });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, shortcut } = req.body;
    const category = {
        name,
        shortcut,
    };
    try {
        const categoryCreated = yield prisma.category.create({
            data: category,
        });
        res.status(201).send({
            response: `Category ${categoryCreated.name} successfully created.`,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ error: "Invalid category ID" });
    }
    try {
        yield prisma.category.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Category with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Category not found or already deleted." });
    }
}));
exports.default = router;
