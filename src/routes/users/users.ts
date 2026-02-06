import { Response, Request } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/db/prisma";
import { User } from "../../prisma/generated/client";
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateUserType,
} from "../../types/auth";
import { parseRegisterRequest } from "../../service/credentialsService";
import { ROLES } from "../../constants";
import ResourceNotFoundError from "../../errors/ResourceNotFoundError";
import { prepareSelectedColumns } from "../../service/usersService";
import AuthenticationError from "../../errors/AuthenticationError";

const SALT = 10;
const USERS_SELECTED_COLUMNS = [
  "id",
  "username",
  "email",
  "name",
  "surname",
  "role",
];

export const getAllUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    select: prepareSelectedColumns(USERS_SELECTED_COLUMNS),
  });
  res.status(200).send({ response: users });
};

export const getActiveUser = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) throw new AuthenticationError("User not authenticated.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: prepareSelectedColumns(USERS_SELECTED_COLUMNS),
  });
  if (!user) throw new ResourceNotFoundError("User not found.");
  res.status(200).json({ response: user });
};

// add method getUser - to retrieve a particular user, not active.

export const createUser = async (req: Request, res: Response) => {
  const { username, email, password } = parseRegisterRequest(req.body);
  const hashedPassword = await bcrypt.hash(password, SALT);
  const user: RegisterCredentials = {
    username,
    email,
    password: hashedPassword,
    role: ROLES.USER,
  };
  const createdUser = await prisma.user.create({
    data: user,
  });
  if (!createdUser) throw new ResourceNotFoundError("User instance not found.");
  res.status(201).location(`/users/${createdUser.id}`);
  // add sending e-mail with registration link
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) throw new ResourceNotFoundError("User not found.");
  // add case of admin who want to change user who is not him - here?? not sure.
  const userFragment: UpdateUserType = req.body;
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: userFragment,
  });
  if (!updatedUser) throw new ResourceNotFoundError("User instance not found.");
  res.status(200).send({ response: userFragment });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) throw new ResourceNotFoundError("User not found.");
  const { oldPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ResourceNotFoundError("User instance not found.");
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid)
    throw new AuthenticationError("Lack of valid authentication!");
  const hashedPassword = await bcrypt.hash(newPassword, SALT);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
  res.status(204);
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.auth?.id;
  if (!userId) throw new ResourceNotFoundError("User not found.");
  // OF COURSE CHECK TO BE PERFORMED - cause u almost never delete your own account...
  await prisma.user.delete({
    where: { id: userId },
  });
  res.status(204);
};
