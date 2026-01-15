"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.editAccount = exports.getAccount = exports.getMyAccounts = exports.deleteAccount = exports.createAccount = exports.getMainAccount = exports.getAllAccounts = void 0;
const client_1 = require("../../prisma/generated/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const connectionString = process.env.DATABASE_URL;
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllAccounts = async (_req, res, next) => {
    try {
        const accounts = await prisma.account.findMany();
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
};
exports.getAllAccounts = getAllAccounts;
const getMainAccount = async (req, res, next) => {
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const acc = await prisma.user.findUnique({
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
};
exports.getMainAccount = getMainAccount;
const createAccount = async (req, res, next) => {
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
                const newAccount = await prisma.account.create({
                    data: {
                        name,
                        type,
                        balance: client_1.Prisma.Decimal(balance),
                        description,
                        ownerId: null,
                        lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
                    },
                });
                await prisma.userToAccount.create({
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
                    const newlyCreatedAccount = await prisma.account.create({
                        data: {
                            name,
                            type,
                            balance: client_1.Prisma.Decimal(balance),
                            description,
                            ownerId: userId,
                            lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
                        },
                    });
                    await prisma.user.update({
                        where: { id: userId },
                        data: { mainAccountId: newlyCreatedAccount.id },
                    });
                }
                else {
                    await prisma.account.create({
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
};
exports.createAccount = createAccount;
const deleteAccount = async (req, res, next) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        await prisma.account.delete({
            where: { id },
        });
        res
            .status(200)
            .json({ message: `Account with ID ${id} deleted successfully.` });
    }
    catch (error) {
        res.status(404).json({ error: "Account not found or already deleted." });
    }
};
exports.deleteAccount = deleteAccount;
const getMyAccounts = async (req, res, next) => {
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const sharedAccountLinks = await prisma.userToAccount.findMany({
            where: { userId: userId },
            select: { accountId: true },
        });
        const sharedAccountIds = sharedAccountLinks.map((link) => link.accountId);
        const accounts = await prisma.account.findMany({
            where: {
                OR: [{ ownerId: userId }, { id: { in: sharedAccountIds } }],
            },
        });
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user accounts" });
    }
};
exports.getMyAccounts = getMyAccounts;
const getAccount = async (req, res, next) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
        const account = await prisma.account.findUnique({
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
};
exports.getAccount = getAccount;
const editAccount = async (req, res, next) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, balance, description } = req.body;
    // const userId = req.user?.id;
    const userId = "";
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const updatedAccount = await prisma.account.update({
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
};
exports.editAccount = editAccount;
