import { NextFunction, Request, Response } from "express";
import EntityNotFoundError from "../../errors/ResourceNotFoundError";
import ResourceNotFoundError from "../../errors/ResourceNotFoundError";

export const getError = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  throw new ResourceNotFoundError("Elo, elo 320!");
};
