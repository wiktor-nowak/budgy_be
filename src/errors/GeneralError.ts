import { ERROR_CODES } from "../constants";
import CustomError from "./CustomError";

class GeneralErrror extends CustomError<ERROR_CODES.GEN> {
  constructor(message = "Invalid request.") {
    super({
      message,
      statusCode: 400,
      code: ERROR_CODES.GEN,
    });
  }
}

export default GeneralErrror;
