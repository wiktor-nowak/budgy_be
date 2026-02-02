import { Response, Request, NextFunction } from "express";
import bcrypt from "bcrypt";
import EntityNotFoundError from "../../errors/EntityNotFoundError";
import { prisma } from "../../lib/prisma";
import { User } from "../../prisma/generated/client";
import { LoginCredentials, RegisterCredentials } from "../../types/credentials";
import { parseRegisterRequest } from "../../service/credentials";
import { ROLES } from "../../constants";

const SALT = 10;

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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
    res.status(200).send({ response: users });
  } catch (error) {
    throw new EntityNotFoundError({
      message: "Elo, elo 320! Cannot fetch users.",
      statusCode: 404,
      code: "ERR_NF",
    });
  }
};

export const testUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).send({
      response: {
        dummy: "test user endpoint works",
      },
    });
  } catch (error) {
    throw new EntityNotFoundError({
      message: "Elo, elo 320! Cannot fetch users.",
      statusCode: 404,
      code: "ERR_NF",
    });
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  const userId = req.auth?.payload;

  console.log(userId);

  if (!userId) {
    res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId?.sub },
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
  const { username, email, password, name, surname } = parseRegisterRequest(
    req.body,
  );
  const hashedPassword = await bcrypt.hash(password, SALT);
  const user: RegisterCredentials = {
    username,
    email,
    password: hashedPassword,
    role: ROLES.USER,
    name: name ?? "",
    surname: surname ?? "",
  };
  try {
    const createdUser = await prisma.user.create({
      data: user,
    });
    res
      .status(201)
      .send({ response: `User ${createdUser.username} successfully created.` });

    // add sending e-mail with registration link
  } catch (error) {
    res.status(500).send({ error: error });
  }
};

export const changeUser = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.auth?.payload.sub !== id) {
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

export const changePassword = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const { oldPassword, newPassword } = req.body;

  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.auth?.payload.sub !== id) {
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

export const deleteUser = async (req: Request, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    res.status(400).send({ error: "Invalid user ID" });
    return;
  }
  if (req.auth?.payload.sub !== id) {
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

export const validateUserCredentials = async ({
  email,
  password,
}: LoginCredentials) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid credentials"); // actually user does not exist but we don't want to inform attacker about it.
  }
  const match = await bcrypt.compare(password, user.password); //can be extracted to separate function
  if (!match) {
    throw new Error("Invalid credentials"); // actual mismatching credentials
  }
  return user.id;
};
