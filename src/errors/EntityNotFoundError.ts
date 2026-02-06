import { ERROR_CODES } from "../constants";
import CustomError from "./CustomError";

class EntityNotFoundError extends CustomError<ERROR_CODES.NF> {
  constructor(message = "Invalid credentials") {
    super({
      message,
      statusCode: 401,
      code: ERROR_CODES.NF,
    });
  }
}

export default EntityNotFoundError;
