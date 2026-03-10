import { ERROR_CODES } from "../constants";
import CustomError from "./CustomError";

class ResourceNotFoundError extends CustomError<ERROR_CODES.NF> {
  constructor(message = "Resource not found.") {
    super({
      message,
      statusCode: 404,
      code: ERROR_CODES.NF,
    });
  }
}

export default ResourceNotFoundError;
