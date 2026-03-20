import { NextFunction, Request, Response } from "express";
import GeneralError from "../errors/GeneralError";
import usersService from "../services/users";

export async function requireMainAccount(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const hasMainAccount = await usersService.hasMainAccount(req.auth.id);

  if (!hasMainAccount) {
    throw new GeneralError(
      "Create your first main account before accessing this feature.",
    );
  }

  next();
}
