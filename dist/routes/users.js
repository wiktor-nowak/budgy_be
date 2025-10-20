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
const bcrypt_1 = __importDefault(require("bcrypt"));
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const SALT = 10;
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        select: { id: true, username: true },
    });
    return users;
});
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield getAllUsers();
        console.log(users);
        res.status(200).send({ response: users });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, isAdmin } = req.body;
    const hashedPassword = yield bcrypt_1.default.hash(password, SALT);
    const user = {
        username,
        email,
        password: hashedPassword,
        role: isAdmin ? "ADMIN" : "USER",
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
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
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
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
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
}));
exports.default = router;
