"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = exports.SIGNING_OPTIONS = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
exports.SIGNING_OPTIONS = {
    algorithm: "RS256",
    expiresIn: 10 * 60, // 10 minutes
};
// Create token
const signAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, exports.SIGNING_OPTIONS);
};
exports.signAccessToken = signAccessToken;
// Verify token
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyAccessToken = verifyAccessToken;
// id: user.id,
// role: user.role || ROLES.USER,
