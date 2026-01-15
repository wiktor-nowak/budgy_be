import { z } from "zod";
import { ROLES } from "../constants";

const passwordRegex = /^(?=.*[0-9])(?=.*[@!#$%^&*])/;
const passwordCheck = z.string().min(6).max(20).regex(passwordRegex, {
  message: "Password must contain at least one digit and one special character",
});
const loginSchema = z.object({
  email: z.string().email(),
  password: passwordCheck,
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: passwordCheck,
  role: z.nativeEnum(ROLES),
  name: z.string().min(2).optional(),
  surname: z.string().min(2).optional(),
});

export function parseLoginRequest(reqBody: unknown) {
  const requestParsed = loginSchema.safeParse(reqBody);
  if (!requestParsed.success) {
    throw new Error(JSON.stringify(requestParsed.error));
  }
  return requestParsed.data;
}

export function parseRegisterRequest(reqBody: unknown) {
  const requestParsed = registerSchema.safeParse(reqBody);
  if (!requestParsed.success) {
    throw new Error(JSON.stringify(requestParsed.error));
  }
  return requestParsed.data;
}
