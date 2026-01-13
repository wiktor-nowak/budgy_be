"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authentication_1 = require("../../middleware/authentication");
const users_1 = require("./users");
const users = express_1.default.Router();
users.get("/", authentication_1.authMiddleware, users_1.getAllUsers);
users.get("/test", authentication_1.authMiddleware, users_1.testUser);
users.get("/current-user", authentication_1.authMiddleware, users_1.getUserDetails);
users.post("/", users_1.createUser);
users.patch("/:id", authentication_1.authMiddleware, users_1.changeUser);
users.patch("/:id/password", authentication_1.authMiddleware, users_1.changePassword);
users.delete("/:id", authentication_1.authMiddleware, users_1.deleteUser);
exports.default = users;
