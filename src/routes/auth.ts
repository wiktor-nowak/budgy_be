// LOGIN

import express, { Response, Request, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";

const connectionString = process.env.DATABASE_URL;
const jwtSecret = process.env.JWT_SECRET as string;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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

router.post("/", async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json(result.error);
    return;
  }
  const { email, password } = result.data;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!dbUser) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = createToken(dbUser);
    res.status(200).send({
      message: `User ${dbUser.name} successfully authenticated!`,
      token: token,
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

router.post(
  "/refresh",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        const token = createToken(user);
        res.status(200).send({ token: token });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh token" });
    }
  }
);

router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ response: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
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
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, jwtSecret) as { id: string };
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ error: "Missing token" });
  }
}

export default router;
