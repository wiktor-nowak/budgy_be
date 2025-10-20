// LOGIN

import express, { Response, Request, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const connectionString = process.env.DATABASE_URL;
import type { Secret } from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET as string;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const SALT = 10;
const expiryTime = "1h";

// Create token
const createToken = (user: User) => {
  return jwt.sign(
    { exp: Math.floor(Date.now() / 1000) + 60 * 60, id: user.id },
    jwtSecret
  );
};

const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
const passwordCheck = z.string().min(6).max(20).regex(passwordRegex, {
  message: "Password must contain at least one digit and one special character",
});
const loginSchema = z.object({
  email: z.string().email(),
  password: passwordCheck,
});

router.post("/", async (req: Request, res: Response): Promise<any> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json(result.error);
  const { email, password } = result.data;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!dbUser) return res.status(400).json({ error: "Invalid credentials" });
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

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
  } catch (error) {
    res.status(500).send({ error: error });
    console.error("FUCKEDUP");
  } finally {
    return res;
  }
});

export interface AuthRequest extends Request {
  user?: { id: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  if (!authHeader) {
    res.status(401).json({ error: "Missing token" });
  } else {
    const token = authHeader.split(" ")[1];
    console.log(token);
    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
      };
      console.log(decoded.id);
      req.user = { id: decoded.id };
      console.log(req);
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  }
}

export default router;
