import CustomError from "./CustomError";

class AuthenticationError extends CustomError<ErrorCode> {}

export default AuthenticationError;
