import { NextFunction, Request, Response } from "express";
import CustomError from "../errors/CustomError";

export default function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof CustomError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }

  console.error("UNEXPECTED ERROR: ", error);

  return res.status(500).json({
    message: "Internal server error.",
  });
}
