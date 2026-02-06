import { prisma } from "../lib/db/prisma";
import { LoginCredentials } from "../types/credentials";
import bcrypt from "bcrypt";

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
