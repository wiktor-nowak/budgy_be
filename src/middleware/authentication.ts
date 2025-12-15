import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@prisma/client";
import config from "../config";
import AuthenticationError from "../errors/AuthenticationError";

const jwtSecret = process.env.JWT_SECRET as string;

// Create token
export const createToken = (user: User) => {
  return jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      id: user.id,
      role: user.role,
    },
    jwtSecret,
  );
};

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError({
      message: "Authorization header missing or malformed.",
      statusCode: 401,
      code: "ERR_AUTH",
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.appSecret);
    req.auth = { payload: decoded as JwtPayload, token };
    next();
  } catch (error) {
    throw new AuthenticationError({
      message: "You are not authorized to perform this operation.",
      statusCode: 403,
      code: "ERR_AUTH",
    });
  }
};
