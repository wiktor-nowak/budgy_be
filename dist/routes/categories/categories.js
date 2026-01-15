"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editCategory = exports.deleteCategory = exports.getCategory = exports.addCategory = exports.getAllCategories = void 0;
const prisma_1 = require("../../lib/prisma");
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany();
        res.status(200).send({ response: categories });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getAllCategories = getAllCategories;
const addCategory = async (req, res, next) => {
    const { name, shortcut } = req.body;
    const category = {
        name,
        shortcut,
    };
    try {
        const categoryCreated = await prisma_1.prisma.category.create({
            data: category,
        });
        res.status(201).send({
            response: `Category ${categoryCreated.name} successfully created.`,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
};
exports.addCategory = addCategory;
const getCategory = async (req, res, next) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const category = await prisma_1.prisma.category.findUnique({
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
};
exports.getCategory = getCategory;
const deleteCategory = async (req, res, next) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    console.log(id);
    try {
        await prisma_1.prisma.category.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Category with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Category not found or already deleted." });
    }
};
exports.deleteCategory = deleteCategory;
const editCategory = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, shortcut } = req.body;
    const category = {
        name,
        shortcut,
    };
    try {
        const updatedCategory = await prisma_1.prisma.category.update({
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
};
exports.editCategory = editCategory;
