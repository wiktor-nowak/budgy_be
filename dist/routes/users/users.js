"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserCredentials = exports.deleteUser = exports.changePassword = exports.changeUser = exports.createUser = exports.getUserDetails = exports.testUser = exports.getAllUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const EntityNotFoundError_1 = __importDefault(require("../../errors/EntityNotFoundError"));
const prisma_1 = require("../../lib/prisma");
const credentials_1 = require("../../service/credentials");
const constants_1 = require("../../constants");
const SALT = 10;
const getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma_1.prisma.user.findMany({
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
};
exports.getAllUsers = getAllUsers;
const testUser = async (req, res, next) => {
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
};
exports.testUser = testUser;
const getUserDetails = async (req, res) => {
    const userId = req.auth?.payload;
    console.log(userId);
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId?.sub },
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
};
exports.getUserDetails = getUserDetails;
const createUser = async (req, res) => {
    const { username, email, password, name, surname } = (0, credentials_1.parseRegisterRequest)(req.body);
    const hashedPassword = await bcrypt_1.default.hash(password, SALT);
    const user = {
        username,
        email,
        password: hashedPassword,
        role: constants_1.ROLES.USER,
        name: name ?? undefined,
        surname: surname ?? undefined,
    };
    try {
        const createdUser = await prisma_1.prisma.user.create({
            data: user,
        });
        res
            .status(201)
            .send({ response: `User ${createdUser.username} successfully created.` });
        // add sending e-mail with registration link
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
};
exports.createUser = createUser;
const changeUser = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (req.auth?.payload.sub !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    const userFragment = req.body;
    try {
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id },
            data: userFragment,
        });
        res.status(200).send({ message: "User updated", user: updatedUser });
    }
    catch (error) {
        res.status(404).send({ error: "User not found or update failed." });
    }
};
exports.changeUser = changeUser;
const changePassword = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { oldPassword, newPassword } = req.body;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (req.auth?.payload.sub !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).send({ error: "User not found." });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(401).send({ error: "Invalid old password." });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(newPassword, SALT);
        await prisma_1.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
        res.status(200).send({ message: "Password updated successfully." });
    }
    catch (error) {
        res.status(500).send({ error: "Failed to update password." });
    }
};
exports.changePassword = changePassword;
const deleteUser = async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
        res.status(400).send({ error: "Invalid user ID" });
        return;
    }
    if (req.auth?.payload.sub !== id) {
        res.status(403).send({ error: "Unauthorized" });
        return;
    }
    try {
        await prisma_1.prisma.user.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `User with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "User not found or already deleted." });
    }
};
exports.deleteUser = deleteUser;
const validateUserCredentials = async ({ email, password, }) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid credentials"); // actually user does not exist but we don't want to inform attacker about it.
    }
    const match = await bcrypt_1.default.compare(password, user.password); //can be extracted to separate function
    if (!match) {
        throw new Error("Invalid credentials"); // actual mismatching credentials
    }
    return user.id;
};
exports.validateUserCredentials = validateUserCredentials;
