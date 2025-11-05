"use strict";
// LOGIN
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
exports.authMiddleware = authMiddleware;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const connectionString = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
// Create token
const createToken = (user) => {
    return jsonwebtoken_1.default.sign({ exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id }, jwtSecret);
};
const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
const passwordCheck = zod_1.z.string().min(6).max(20).regex(passwordRegex, {
    message: "Password must contain at least one digit and one special character",
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: passwordCheck,
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = loginSchema.safeParse(req.body);
    console.log(result);
    if (!result.success) {
        console.log("o");
        res.status(400).json(result.error);
        return;
    }
    console.log("login");
    const { email, password } = result.data;
    try {
        const dbUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (!dbUser) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const match = yield bcrypt_1.default.compare(password, dbUser.password);
        if (!match) {
            res.status(400).json({ error: "Invalid credentials" });
            return;
        }
        const token = createToken(dbUser);
        res.status(200).send({
            message: `User ${dbUser.name} successfully authenticated!`,
            token: token,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
}));
router.post("/refresh", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        else {
            const token = createToken(user);
            res.status(200).send({ token: token });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to refresh token" });
    }
}));
router.get("/me", authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({ error: "User not authenticated" });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true },
        });
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ response: user });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
}));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = { id: decoded.id };
            next();
        }
        catch (err) {
            res.status(403).json({ error: "Invalid token" });
        }
    }
    else {
        res.status(401).json({ error: "Missing token" });
    }
}
exports.default = router;
