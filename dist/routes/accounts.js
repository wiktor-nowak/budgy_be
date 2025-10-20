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
const auth_1 = require("./auth");
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const getAllAccounts = () => __awaiter(void 0, void 0, void 0, function* () {
    const accounts = yield prisma.account.findMany();
    return accounts;
});
router.get("/", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accounts = yield getAllAccounts();
        res.status(200).send({ response: accounts });
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
router.post("/", auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    console.log("hi!");
    const { name, type, balance, description } = req.body;
    let account;
    console.log(name, type, balance, description);
    console.log("In accounts: " + ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id));
    const id = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    try {
        if (!Object.values(client_1.AccountType).includes(type)) {
            throw new Error("Type is not properly defined!");
        }
        if (type === client_1.AccountType.SHARED) {
            account = {
                name,
                type,
                description,
                ownerId: null,
                balance: client_1.Prisma.Decimal(balance),
                lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
            };
            const accountCreated = yield prisma.account.create({
                data: account,
            });
            if (id) {
                const u2a = {
                    userId: id,
                    accountId: accountCreated.id,
                };
                yield prisma.userToAccount.create({
                    data: u2a,
                });
            }
            else {
                res.status(404).send({ response: `Id number not found!` });
            }
        }
        else {
            account = {
                name,
                type,
                description,
                ownerId: (_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id) !== null && _d !== void 0 ? _d : null,
                balance: client_1.Prisma.Decimal(balance),
                lastMonthlyBalance: client_1.Prisma.Decimal(0.0),
            };
            console.log(account);
            const acc1 = yield prisma.account.create({
                data: account,
            });
            console.log(acc1);
        }
        res.status(201).send({
            response: `Account ${account.name} created!`,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
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
router.get("/my-accounts", auth_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { name, balance, description } = req.body;
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
        res.status(500).send({ error: error });
    }
}));
exports.default = router;
