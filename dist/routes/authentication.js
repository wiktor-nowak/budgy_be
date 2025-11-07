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
const zod_1 = require("zod");
const authentication_1 = require("../middleware/authentication");
const connectionString = process.env.DATABASE_URL;
const router = express_1.default.Router();
const adapter = new adapter_pg_1.PrismaPg({ connectionString });
const prisma = new client_1.PrismaClient({ adapter });
const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
// TODO Password check is done twice, on frontend and on backend!
const passwordCheck = zod_1.z.string().min(6).max(20).regex(passwordRegex, {
    message: "Password must contain at least one digit and one special character",
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: passwordCheck,
});
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestParsed = loginSchema.safeParse(req.body);
    if (!requestParsed.success) {
        res.status(400).json(requestParsed.error);
        return;
    }
    const { email, password } = requestParsed.data;
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
        const token = (0, authentication_1.createToken)(dbUser);
        res.status(200).send({
            message: `User ${dbUser.name} successfully authenticated!`,
            token: token,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
}));
exports.default = router;
