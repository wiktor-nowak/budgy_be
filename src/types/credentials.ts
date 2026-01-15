import { User } from "../../prisma/generated/client";

export type LoginCredentials = Pick<User, "email" | "password">;

export type RegisterCredentials = Pick<
  User,
  "username" | "email" | "password" | "role"
> &
  Pick<Partial<User>, "name" | "surname">;
