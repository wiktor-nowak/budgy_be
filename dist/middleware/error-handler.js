"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const errors_1 = require("../service/errors");
const config_1 = __importDefault(require("../config"));
const CustomError_1 = __importDefault(require("../errors/CustomError"));
const express_oauth2_jwt_bearer_1 = require("express-oauth2-jwt-bearer");
function errorHandler(error, req, res, next) {
    if (res.headersSent || config_1.default.debug) {
        next(error);
        return;
    }
    if (error instanceof CustomError_1.default) {
        res.status(error.statusCode).json({
            error: {
                message: error.message,
                code: error.code,
            },
        });
        return;
    }
    if (error instanceof express_oauth2_jwt_bearer_1.UnauthorizedError) {
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
            message: (0, errors_1.getErrorMessage)(error) ||
                "An error occured. View logs for more details.",
        },
    });
}
