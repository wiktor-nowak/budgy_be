"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = void 0;
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
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
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            req.user = { id: decoded.id, role: decoded.role };
            next();
        }
        catch (err) {
            res.status(403).json({ error: "Invalid token" });
        }
    }
    else {
        res.status(401).json({ error: "Missing token" });
    }
}
