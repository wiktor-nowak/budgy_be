import { ERROR_CODES } from "../constants";
import CustomError from "./CustomError";

class AuthenticationError extends CustomError<ERROR_CODES.AUTH> {
  constructor(message = "Invalid credentials") {
    super({
      message,
      statusCode: 401,
      code: ERROR_CODES.AUTH,
    });
  }
}

export default AuthenticationError;
