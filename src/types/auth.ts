import { Role, User } from "../prisma/generated/client";

export type LoginCredentials = Pick<User, "email" | "password">;

export type RegisterCredentials = Pick<
  User,
  "username" | "email" | "password" | "role"
>;

export type UpdateUserType = Partial<
  Pick<User, "name" | "email" | "surname" | "username" | "mainAccountId">
>;

export interface AccessTokenPayload {
  id: string;
  roles?: Role[];
}
