import jwt from "jsonwebtoken";
import { AccessTokenPayload } from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET as string;

const SIGNING_OPTIONS = {
  expiresIn: 10 * 60, // 10 minutes
};

// PAYLOAD TYPE:
// { id: user.id,
// role: user.role || ROLES.USER, }

const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, SIGNING_OPTIONS);
};

const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
};

export default {
  signAccessToken,
  SIGNING_OPTIONS,
  verifyAccessToken,
};
