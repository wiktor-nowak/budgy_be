import AuthenticationError from "../errors/AuthenticationError";
import ResourceNotFoundError from "../errors/ResourceNotFoundError";
import { prisma } from "../lib/db/prisma";
import { Role } from "../prisma/generated/enums";
import {
  LoginCredentials,
  RegisterCredentials,
  UpdateUserType,
} from "../types/auth";
import bcrypt from "bcrypt";
import mailService from "./mail";
import utilityServices from "./utility";
import { mailer } from "../lib/emails/mailer";
import { TransactionClient } from "../prisma/generated/internal/prismaNamespace";

const SALT = 10;
const USERS_SELECTED_COLUMNS = [
  "id",
  "username",
  "email",
  "name",
  "surname",
  "role",
];

async function validateCredentials({ email, password }: LoginCredentials) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid credentials"); // actually user does not exist but we don't want to inform attacker about it.
  }
  if (!user?.isVerified) {
    throw new AuthenticationError("Please verify your email first.");
  }
  const match = await bcrypt.compare(password, user.password); //can be extracted to separate function
  if (!match) {
    throw new Error("Invalid credentials"); // actual mismatching credentials
  }
  return user.id;
}

function prepareSelectedColumns(columns: string[]) {
  return columns.reduce(
    (selection, column) => ({
      ...selection,
      [column]: true,
    }),
    {},
  );
}

async function updateUser(id: string, userFragment: UpdateUserType) {
  return await prisma.user.update({
    where: { id },
    data: userFragment,
  });
}

async function getAllUsers() {
  return await prisma.user.findMany({
    select: prepareSelectedColumns(USERS_SELECTED_COLUMNS),
  });
}

async function getActiveUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: prepareSelectedColumns(USERS_SELECTED_COLUMNS),
  });
}

async function createUser(username: string, email: string, password: string) {
  return prisma.$transaction(async (tx) => {
    const hashedPassword = await bcrypt.hash(password, SALT);
    const userData: RegisterCredentials = {
      username,
      email,
      password: hashedPassword,
      role: Role.USER,
    };
    const user = await tx.user.create({
      data: userData,
    });
    await mailService.sendVeryficationEmail(user, tx as TransactionClient);

    return user;
  });
}

async function changePassword(
  id: string,
  oldPassword: string,
  newPassword: string,
) {
  prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id },
    });

    if (!user) throw new ResourceNotFoundError("User instance not found.");
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid)
      throw new AuthenticationError("Lack of valid authentication!");
    const hashedPassword = await bcrypt.hash(newPassword, SALT);
    await tx.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  });
}

async function verifyUser(id: string) {
  return await prisma.user.update({
    where: { id },
    data: { isVerified: true },
  });
}

async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });
}

export default {
  changePassword,
  createUser,
  deleteUser,
  getActiveUser,
  getAllUsers,
  prepareSelectedColumns,
  updateUser,
  validateCredentials,
};
