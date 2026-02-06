import { ERROR_CODES } from "../constants";
import CustomError from "./CustomError";

class DatabaseError extends CustomError<ERROR_CODES.DB> {
  constructor(message = "Database error.") {
    super({
      message,
      statusCode: 500,
      code: ERROR_CODES.DB,
    });
  }
}

export default DatabaseError;
