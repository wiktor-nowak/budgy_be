import { NextFunction, Response } from "express";
import { AuthenticationRequest } from "./authentication";

export function authorize(allowedRoles: string[]) {
  return (
    req: AuthenticationRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user || !req.user.role) {
      res
        .status(401)
        .json({ error: "User not authenticated or role not found." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions." });
      return;
    }
    next();
  };
}
