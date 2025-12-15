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
const authentication_1 = require("../middleware/authentication");
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllAccounts = () => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield prisma.account.findMany();
    return accounts;
});
router.get("/", authentication_1.authenticateUser, (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield getAllAccounts();
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
router.get("/main-account", authentication_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.post("/", authentication_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.get("/my-accounts", authentication_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
router.patch("/:id", authentication_1.authenticateUser, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
exports.default = router;
