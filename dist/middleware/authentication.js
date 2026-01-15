"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const AuthenticationError_1 = __importDefault(require("../errors/AuthenticationError"));
const accessToken_1 = require("../service/accessToken");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError_1.default({
            message: "Authorization header missing or malformed.",
            statusCode: 401,
            code: "ERR_AUTH",
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.auth = (0, accessToken_1.verifyAccessToken)(token);
        next();
    }
    catch (error) {
        throw new AuthenticationError_1.default({
            message: "You are not authorized to perform this operation.",
            statusCode: 403,
            code: "ERR_AUTH",
        });
    }
};
exports.authMiddleware = authMiddleware;
