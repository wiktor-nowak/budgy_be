import express, { Response, Request } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { authMiddleware, AuthRequest } from "./auth";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const SALT = 10;

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: { id: true, username: true },
  });
  return users;
};

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    console.log(users);
    res.status(200).send({ response: users });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

router.post("/", async (req: Request, res: Response) => {
  const { username, email, password, isAdmin } = req.body;
  const hashedPassword = await bcrypt.hash(password, SALT);
  const user: Omit<
    User,
    "id" | "createdAt" | "updatedAt" | "name" | "surname" | "mainAccountId"
  > = {
    username,
    email,
    password: hashedPassword,
    role: isAdmin ? "ADMIN" : "USER",
  };
  console.log(user);
  try {
    const createdUser = await prisma.user.create({
      data: user,
    });
    res
      .status(201)
      .send({ response: `User ${createdUser.username} successfully created.` });
  } catch (error) {
    res.status(500).send({ error: error });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
  }
  const userFragment: Partial<
    Pick<
      User,
      "name" | "email" | "password" | "role" | "surname" | "mainAccountId"
    >
  > = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userFragment,
    });
    res.status(200).send({ message: "User updated", user: updatedUser });
  } catch (error) {
    res.status(404).send({ error: "User not found or update failed." });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
  }

  try {
    await prisma.user.delete({
      where: { id },
    });

    res
      .status(200)
      .json({ message: `User with ID ${id} deleted successfully.` });
  } catch (error) {
    res.status(404).json({ error: "User not found or already deleted." });
  }
});

export default router;
