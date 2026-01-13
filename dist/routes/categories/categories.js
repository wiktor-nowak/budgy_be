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
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCategory = exports.deleteCategory = exports.getCategory = exports.addCategory = exports.getAllCategories = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield prisma.category.findMany();
        res.status(200).send({ response: categories });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getAllCategories = getAllCategories;
const addCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
});
exports.addCategory = addCategory;
const getCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const category = yield prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            res.status(404).json({ error: "Category not found" });
        }
        else {
            res.status(200).send({ response: category });
        }
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getCategory = getCategory;
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(id);
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
});
exports.deleteCategory = deleteCategory;
const editCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, shortcut } = req.body;
    const category = {
        name,
        shortcut,
    };
    try {
        const updatedCategory = yield prisma.category.update({
            where: { id },
            data: category,
        });
        res.status(200).send({
            response: `Category ${updatedCategory.name} successfully updated.`,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
});
exports.editCategory = editCategory;
