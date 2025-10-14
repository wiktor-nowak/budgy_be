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
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany();
    return users;
});
// Create token
const createToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, jwtSecret, {
        expiresIn: expiryTime,
    });
};
const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
const passwordCheck = zod_1.z.string().min(6).max(20).regex(passwordRegex, {
    message: "Password must contain at least one digit and one special character",
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: passwordCheck,
});
// router.get("/", async (_req: Request, res: Response) => {
//   try {
//     const users = await getAllUsers();
//     res.status(200).send({ response: users });
//   } catch (error) {
//     res.status(500).json({ error: error });
//   }
// });
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
// router.patch("/:id", async (req: Request, res: Response): Promise<any> => {
//   const id = Number(req.params.id);
//   if (isNaN(id)) return res.status(400).send({ error: "Invalid user ID" });
//   const userFragment: Partial<
//     Pick<User, "name" | "email" | "password" | "role">
//   > = req.body;
//   try {
//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: userFragment,
//     });
//     return res.status(200).send({ message: "User updated", user: updatedUser });
//   } catch (error) {
//     return res.status(404).send({ error: "User not found or update failed." });
//   }
// });
// router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
//   const id = Number(req.params.id);
//   if (isNaN(id)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }
//   try {
//     await prisma.user.delete({
//       where: { id },
//     });
//     return res
//       .status(200)
//       .json({ message: `User with ID ${id} deleted successfully.` });
//   } catch (error) {
//     return res
//       .status(404)
//       .json({ error: "User not found or already deleted." });
//   }
// });
exports.default = router;
