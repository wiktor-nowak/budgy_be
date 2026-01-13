import jwt from "jsonwebtoken";
import { ROLES } from "../constants";
import { AccessTokenPayload } from "../types/tokens";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const SIGNING_OPTIONS = {
  algorithm: "RS256" as const,
  expiresIn: 10 * 60, // 10 minutes
};

// Create token
export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, SIGNING_OPTIONS);
};

// Verify token
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
};

// id: user.id,
// role: user.role || ROLES.USER,
