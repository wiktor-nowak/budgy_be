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
const SALT = 10;
const expiryTime = "1h";
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
    if (!result.success)
        return res.status(400).json(result.error);
    const { email, password } = result.data;
    try {
        const dbUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (!dbUser)
            return res.status(400).json({ error: "Invalid credentials" });
        const match = yield bcrypt_1.default.compare(password, dbUser.password);
        if (!match)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = createToken(dbUser);
        res
            .status(200)
            .cookie("token", token, { httpOnly: true, maxAge: 3600000 })
            .send({
            message: `User ${dbUser.name} successfully authenticated!`,
            token: token,
        });
        console.log(token);
        console.log(res);
    }
    catch (error) {
        res.status(500).send({ error: error });
        console.error("FUCKEDUP");
    }
    finally {
        return res;
    }
}));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader) {
        res.status(401).json({ error: "Missing token" });
    }
    else {
        const token = authHeader.split(" ")[1];
        console.log(token);
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            console.log(decoded.id);
            req.user = { id: decoded.id };
            console.log(req);
            next();
        }
        catch (err) {
            res.status(403).json({ error: "Invalid token" });
        }
    }
}
exports.default = router;
