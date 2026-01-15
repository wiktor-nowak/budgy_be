import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export const SIGNING_OPTIONS = {
    algorithm: "RS256",
    expiresIn: 10 * 60, // 10 minutes
};
// Create token
export const signAccessToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, SIGNING_OPTIONS);
};
// Verify token
export const verifyAccessToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
// id: user.id,
// role: user.role || ROLES.USER,
