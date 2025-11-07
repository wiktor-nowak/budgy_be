"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
function authorize(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res
                .status(401)
                .json({ error: "User not authenticated or role not found." });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: "Forbidden: Insufficient permissions." });
            return;
        }
        next();
    };
}
