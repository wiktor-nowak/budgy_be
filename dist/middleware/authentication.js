import AuthenticationError from "../errors/AuthenticationError";
import { verifyAccessToken } from "../service/accessToken";
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AuthenticationError({
            message: "Authorization header missing or malformed.",
            statusCode: 401,
            code: "ERR_AUTH",
        });
    }
    const token = authHeader.split(" ")[1];
    try {
        req.auth = verifyAccessToken(token);
        next();
    }
    catch (error) {
        throw new AuthenticationError({
            message: "You are not authorized to perform this operation.",
            statusCode: 403,
            code: "ERR_AUTH",
        });
    }
};
