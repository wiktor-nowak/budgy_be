import { ERROR_CODES } from "../constants";

abstract class CustomError<C extends string = ERROR_CODES> extends Error {
  public readonly statusCode: number;
  public readonly code?: C;
  public readonly isOperational = true;

  constructor({
    message,
    statusCode,
    code,
  }: {
    message: string;
    statusCode: number;
    code?: C;
  }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
