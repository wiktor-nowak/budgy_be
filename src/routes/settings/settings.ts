import { NextFunction, Response, Request } from "express";

export const getAllSettings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).send({
      response: "Hi",
    });
  } catch (error) {
    res.status(500).send({ error: error });
  }
};
