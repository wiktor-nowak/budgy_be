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
    res
      .status(200)
      .cookie("token", token, { httpOnly: true, maxAge: 3600000 })
      .send({
        message: `User ${dbUser.name} successfully authenticated!`,
        token: token,
      });
  } catch (error) {
    res.status(500).send({ error: error });
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
  console.log("hello");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("bad thing");
    res.status(401).json({ error: "Missing token" });
  } else {
    console.log("ELO!");
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
      };
      console.log(decoded.id);
      req.user = { id: decoded.id };
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  }
}

export default router;
