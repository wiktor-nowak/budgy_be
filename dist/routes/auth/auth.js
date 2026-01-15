"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
exports.logoutHandler = logoutHandler;
exports.refreshHandler = refreshHandler;
const refreshToken_1 = require("../../service/refreshToken");
const accessToken_1 = require("../../service/accessToken");
const credentials_1 = require("../../service/credentials");
const users_1 = require("../users/users");
async function loginHandler(req, res) {
    try {
        const credentials = (0, credentials_1.parseLoginRequest)(req.body);
        const validatedUserId = await (0, users_1.validateUserCredentials)(credentials);
        // issue new access token
        const accessToken = (0, accessToken_1.signAccessToken)({
            sub: validatedUserId,
        });
        //generate new refresh token
        const newRefreshToken = (0, refreshToken_1.generateRefreshToken)();
        const newHashedRefreshToken = (0, refreshToken_1.hashRefreshToken)(newRefreshToken);
        await (0, refreshToken_1.createRefreshTokenRecord)(newHashedRefreshToken, validatedUserId, (0, refreshToken_1.setExpiresInDays)(30));
        res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            // secure: true // set while on server
            sameSite: "lax",
            path: "/auth/refresh",
        });
        res.status(200).send({
            message: `User ${validatedUserId} successfully logged in!`,
            token: accessToken,
        });
    }
    catch (error) {
        res.status(500).send({ error: error });
    }
}
async function logoutHandler(req, res) {
    const rawToken = req.cookies?.refresh_token;
    if (!rawToken) {
        return res.sendStatus(401); // add sending message!
    }
    const tokenHash = (0, refreshToken_1.hashRefreshToken)(rawToken);
    (0, refreshToken_1.revokeRefreshToken)(tokenHash);
    res.clearCookie("refresh_token", {
        httpOnly: true,
        // secure: true // set while on server
        sameSite: "lax",
        path: "/auth/refresh",
    });
}
async function refreshHandler(req, res) {
    const rawToken = req.cookies?.refresh_token;
    if (!rawToken) {
        return res.sendStatus(401); // add sending message!
    }
    const tokenHash = (0, refreshToken_1.hashRefreshToken)(rawToken);
    const existing = await (0, refreshToken_1.validateRefreshToken)(tokenHash);
    if (!existing) {
        return res.sendStatus(401);
    }
    //generate new refresh token
    const newRefreshToken = (0, refreshToken_1.generateRefreshToken)();
    const newHashedRefreshToken = (0, refreshToken_1.hashRefreshToken)(newRefreshToken);
    try {
        await (0, refreshToken_1.rotateRefreshToken)(tokenHash, newHashedRefreshToken, existing.userId, (0, refreshToken_1.setExpiresInDays)(30));
    }
    catch (error) {
        await (0, refreshToken_1.revokeAllUserRefreshTokens)(existing.userId);
        return res.sendStatus(401);
    }
    // issue new access token
    const accessToken = (0, accessToken_1.signAccessToken)({
        sub: existing.userId,
    });
    // set new refresh cookie
    res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        // secure: true // set while on server
        sameSite: "lax",
        path: "/auth/refresh",
    });
    return res.status(200).send({
        message: `User ${existing.userId} successfully authenticated!`,
        token: accessToken,
    });
}
