import { NextFunction, Request, Response } from "express";
import EntityNotFoundError from "../../errors/EntityNotFoundError";

export const getError = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  throw new EntityNotFoundError({
    message: "Elo, elo 320!",
    statusCode: 404,
    code: "ERR_NF",
  });
  res.status(200).json({ id: 1 });
};
