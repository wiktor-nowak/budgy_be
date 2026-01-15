import { getErrorMessage } from "../service/errors";
import config from "../config";
import CustomError from "../errors/CustomError";
import { UnauthorizedError } from "express-oauth2-jwt-bearer";
export default function errorHandler(error, req, res, next) {
    if (res.headersSent || config.debug) {
        next(error);
        return;
    }
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                code: error.code,
            },
        });
        return;
    }
    if (error instanceof UnauthorizedError) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                code: "code" in error ? error.code : "ERR_AUTH",
            },
        });
        return;
    }
    res.status(500).json({
        error: {
            message: getErrorMessage(error) ||
                "An error occured. View logs for more details.",
        },
    });
}
