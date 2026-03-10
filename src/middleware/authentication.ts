import { Response, Request, NextFunction } from "express";
import AuthenticationError from "../errors/AuthenticationError";
import accessTokenService from "../services/accessToken";

export const authMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AuthenticationError("Authorization header missing or malformed.");
  }

  const token = authHeader.split(" ")[1];
  try {
    const verifiedToken = accessTokenService.verifyAccessToken(token);
    req.auth = verifiedToken;
    next();
  } catch (error) {
    throw new AuthenticationError(
      "You are not authorized to perform this operation.",
    );
  }
};
