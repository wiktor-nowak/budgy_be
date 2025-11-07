import { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

const jwtSecret = process.env.JWT_SECRET as string;

export interface AuthenticationRequest extends Request {
  user?: { id: string; role: string };
}

// Create token
export const createToken = (user: User) => {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      id: user.id,
      role: user.role,
    },
    jwtSecret
  );
};

export function authenticate(
  req: AuthenticationRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        role: string;
      };
      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (err) {
      res.status(403).json({ error: "Invalid token" });
    }
  } else {
    res.status(401).json({ error: "Missing token" });
  }
}
