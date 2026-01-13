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
exports.deleteUser = exports.changePassword = exports.changeUser = exports.createUser = exports.getUserDetails = exports.testUser = exports.getAllUsers = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
// import { authMiddleware } from "../../middleware/authentication";
// import { authorize } from "../../middleware/authorization";
const EntityNotFoundError_1 = __importDefault(require("../../errors/EntityNotFoundError"));
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const SALT = 10;
const getAllUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                surname: true,
                role: true,
            },
        });
        res.status(200).send({ response: users });
    }
    catch (error) {
        throw new EntityNotFoundError_1.default({
            message: "Elo, elo 320! Cannot fetch users.",
            statusCode: 404,
            code: "ERR_NF",
        });
    }
});
exports.getAllUsers = getAllUsers;
const testUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).send({
            response: {
                dummy: "test user endpoint works",
            },
        });
    }
    catch (error) {
        throw new EntityNotFoundError_1.default({
            message: "Elo, elo 320! Cannot fetch users.",
            statusCode: 404,
            code: "ERR_NF",
        });
    }
});
exports.testUser = testUser;
const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload;
    console.log(userId);
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId === null || userId === void 0 ? void 0 : userId.sub },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                surname: true,
                role: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ response: user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});
exports.getUserDetails = getUserDetails;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, name, surname } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, SALT);
    const user = {
        username,
        email,
        password: hashedPassword,
        role: "USER", // Always assign USER role for new registrations
        name,
        surname,
    };
    console.log(user);
    try {
        const createdUser = yield prisma.user.create({
            data: user,
        });
        res
            .status(201)
            .send({ response: `User ${createdUser.username} successfully created.` });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
});
exports.createUser = createUser;
const changeUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (((_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload.sub) !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    const userFragment = req.body;
    try {
        const updatedUser = yield prisma.user.update({
            where: { id },
            data: userFragment,
        });
        res.status(200).send({ message: "User updated", user: updatedUser });
    }
    catch (error) {
        res.status(404).send({ error: "User not found or update failed." });
    }
});
exports.changeUser = changeUser;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    const { oldPassword, newPassword } = req.body;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (((_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload.sub) !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).send({ error: "User not found." });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).send({ error: "Invalid old password." });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, SALT);
        yield prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        res.status(200).send({ message: "Password updated successfully." });
    }
    catch (error) {
        res.status(500).send({ error: "Failed to update password." });
    }
});
exports.changePassword = changePassword;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const id = req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (((_a = req.auth) === null || _a === void 0 ? void 0 : _a.payload.sub) !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    try {
        yield prisma.user.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `User with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "User not found or already deleted." });
    }
});
exports.deleteUser = deleteUser;
