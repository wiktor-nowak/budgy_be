"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const categories_1 = require("./categories");
const categrories = express_1.default.Router();
categrories.get("/", authentication_1.authMiddleware, categories_1.getAllCategories);
categrories.post("/", authentication_1.authMiddleware, categories_1.addCategory);
categrories.get("/:id", authentication_1.authMiddleware, categories_1.getCategory);
categrories.delete("/:id", authentication_1.authMiddleware, categories_1.deleteCategory);
categrories.patch("/:id", authentication_1.authMiddleware, categories_1.editCategory);
exports.default = categrories;
