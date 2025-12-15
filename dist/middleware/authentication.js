"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = exports.createToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const AuthenticationError_1 = __importDefault(require("../errors/AuthenticationError"));
const jwtSecret = process.env.JWT_SECRET;
// Create token
const createToken = (user) => {
    return jsonwebtoken_1.default.sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        id: user.id,
        role: user.role,
    }, jwtSecret);
};
exports.createToken = createToken;
const authenticateUser = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.appSecret);
        req.auth = { payload: decoded, token };
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
exports.authenticateUser = authenticateUser;
