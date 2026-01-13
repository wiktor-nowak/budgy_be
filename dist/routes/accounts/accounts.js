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
exports.editAccount = exports.getAccount = exports.getMyAccounts = exports.deleteAccount = exports.createAccount = exports.getMainAccount = exports.getAllAccounts = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllAccounts = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield prisma.account.findMany();
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getAllAccounts = getAllAccounts;
const getMainAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const acc = yield prisma.user.findUnique({
            where: { id: userId },
            select: { mainAccountId: true },
        });
        // if (!user) {
        //   res.status(404).json({ error: "User not found!" });
        // } else if (user.mainAccountId) {
        //   const account = await prisma.account.findUnique({
        //     where: { id: user.mainAccountId },
        //   });
        //   if (!account) {
        //     res.status(404).json({ error: "Account not found!" });
        //   }
        //   res.status(200).json({ response: account });
        // }
        if (!acc) {
            res.status(404).json({ error: "User not found!" });
        }
        res.status(200).json({ response: acc });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});
exports.getMainAccount = getMainAccount;
const createAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, type, balance, description, isFirstAccount } = req.body;
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    else {
        try {
            if (!Object.values(client_1.AccountType).includes(type)) {
                res.status(400).json({ error: "Invalid account type" });
            }
            if (type === client_1.AccountType.SHARED) {
                const newAccount = yield prisma.account.create({
                    data: {
                        name,
                        type,
                        balance: client_1.Prisma.Decimal(balance),
                        description,
                        ownerId: null,
                        lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
                    },
                });
                yield prisma.userToAccount.create({
                    data: {
                        userId: userId,
                        accountId: newAccount.id,
                    },
                });
                res
                    .status(201)
                    .json({ response: `Account ${newAccount.name} created!` });
            }
            else {
                if (type === client_1.AccountType.BANK) {
                    const newlyCreatedAccount = yield prisma.account.create({
                        data: {
                            name,
                            type,
                            balance: client_1.Prisma.Decimal(balance),
                            description,
                            ownerId: userId,
                            lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
                        },
                    });
                    yield prisma.user.update({
                        where: { id: userId },
                        data: { mainAccountId: newlyCreatedAccount.id },
                    });
                }
                else {
                    yield prisma.account.create({
                        data: {
                            name,
                            type,
                            balance: client_1.Prisma.Decimal(balance),
                            description,
                            ownerId: userId,
                            lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
                        },
                    });
                }
                res.status(201).json({ response: `Account ${name} created!` });
            }
        }
        catch (error) {
            res.status(500).json({ error: "Failed to create account" });
        }
    }
});
exports.createAccount = createAccount;
const deleteAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        yield prisma.account.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Account with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Account not found or already deleted." });
    }
});
exports.deleteAccount = deleteAccount;
const getMyAccounts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const sharedAccountLinks = yield prisma.userToAccount.findMany({
            where: { userId: userId },
            select: { accountId: true },
        });
        const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);
        const accounts = yield prisma.account.findMany({
            where: {
                OR: [{ ownerId: userId }, { id: { in: sharedAccountIds } }],
            },
        });
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user accounts" });
    }
});
exports.getMyAccounts = getMyAccounts;
const getAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const account = yield prisma.account.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        username: true,
                    },
                },
                coOwners: {
                    include: {
                        user: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });
        if (!account) {
            res.status(404).json({ error: "Account not found" });
        }
        else {
            res.status(200).send({ response: account });
        }
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
});
exports.getAccount = getAccount;
const editAccount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, balance, description } = req.body;
    // const userId = req.user?.id;
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const updatedAccount = yield prisma.account.update({
            where: { id },
            data: {
                name,
                balance: client_1.Prisma.Decimal(balance),
                description,
            },
        });
        res.status(200).send({
            response: `Account ${updatedAccount.name} successfully updated.`,
        });
    }
    catch (error) {
        res.status(500).send({ error: "Failed to update account" });
    }
});
exports.editAccount = editAccount;
