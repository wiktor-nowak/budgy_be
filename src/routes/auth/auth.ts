import express, { Response, Request } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { z } from "zod";

// import { createToken } from "../middleware/authentication";

const createToken = (dbUser: unknown) => {
  console.log(dbUser);
};

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
// TODO Password check is done twice, on frontend and on backend!
const passwordCheck = z.string().min(6).max(20).regex(passwordRegex, {
  message: "Password must contain at least one digit and one special character",
});
const loginSchema = z.object({
  email: z.string().email(),
  password: passwordCheck,
});

export const check = async (req: Request, res: Response) => {
  const requestParsed = loginSchema.safeParse(req.body);
  if (!requestParsed.success) {
    res.status(400).json(requestParsed.error);
    return;
  }
  const { email, password } = requestParsed.data;
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
};
