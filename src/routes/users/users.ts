import express, { Response, Request } from "express";
import { PrismaClient, User } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import {
  authenticate,
  AuthenticationRequest,
} from "../../middleware/authentication";
import { authorize } from "../../middleware/authorization";
import EntityNotFoundError from "../../errors/EntityNotFoundError";

const connectionString = process.env.DATABASE_URL;
const router = express.Router();
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const SALT = 10;

const getAllUsers1 = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      surname: true,
      role: true,
    },
  });
  return users;
};

export const getAllUsers = async (
  _req: AuthenticationRequest,
  res: Response
) => {
  try {
    const users = await getAllUsers1();
    throw new EntityNotFoundError({
      message: "Elo, elo 320!",
      statusCode: 404,
      code: "ERR_NF",
    });
    console.log(users);
    res.status(200).send({ response: users });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const getUserDetails = async (
  req: AuthenticationRequest,
  res: Response
) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        surname: true,
        role: true,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ response: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password, name, surname } = req.body;
  const hashedPassword = await bcrypt.hash(password, SALT);
  const user: Omit<User, "id" | "createdAt" | "updatedAt" | "mainAccountId"> = {
    username,
    email,
    password: hashedPassword,
    role: "USER", // Always assign USER role for new registrations
    name,
    surname,
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
};

export const changeUser = async (req: AuthenticationRequest, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.user?.id !== id) {
    res.status(403).send({ error: "Unauthorized" });
    return;
  }
  const userFragment: Partial<
    Pick<User, "name" | "email" | "surname" | "username">
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
};

export const changePassword = async (
  req: AuthenticationRequest,
  res: Response
) => {
  const id = req.params.id;
  const { oldPassword, newPassword } = req.body;

  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.user?.id !== id) {
    res.status(403).send({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).send({ error: "User not found." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).send({ error: "Invalid old password." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.status(200).send({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).send({ error: "Failed to update password." });
  }
};

export const deleteUser = async (req: AuthenticationRequest, res: Response) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.user?.id !== id) {
    res.status(403).send({ error: "Unauthorized" });
    return;
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
};
