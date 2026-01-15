"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = generateRefreshToken;
exports.hashRefreshToken = hashRefreshToken;
exports.createRefreshTokenRecord = createRefreshTokenRecord;
exports.validateRefreshToken = validateRefreshToken;
exports.rotateRefreshToken = rotateRefreshToken;
exports.detectReplay = detectReplay;
exports.revokeRefreshToken = revokeRefreshToken;
exports.revokeAllUserRefreshTokens = revokeAllUserRefreshTokens;
exports.cleanupExpiredRefreshTokens = cleanupExpiredRefreshTokens;
exports.setExpiresInDays = setExpiresInDays;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
// used in cookie
function generateRefreshToken(bytes = 64) {
    return crypto_1.default.randomBytes(bytes).toString("base64url");
}
// goes to DB
function hashRefreshToken(token) {
    return crypto_1.default.createHash("sha256").update(token).digest("base64url");
}
async function createRefreshTokenRecord(tokenHash, userId, expiresAt) {
    const created = await prisma_1.prisma.refreshToken.create({
        data: { tokenHash, userId, expiresAt },
    });
    return created;
}
async function validateRefreshToken(tokenHash) {
    const token = await prisma_1.prisma.refreshToken.findUnique({
        where: { tokenHash },
    });
    if (!token)
        return null;
    if (token.revoked)
        return null;
    if (token.expiresAt < new Date())
        return null;
    return token;
}
async function rotateRefreshToken(oldTokenHash, newTokenHash, userId, expiresAt) {
    return prisma_1.prisma.$transaction(async (tx) => {
        // validate existing token?
        const existing = await tx.refreshToken.findUnique({
            where: { tokenHash: oldTokenHash },
        });
        // logic
        if (!existing || existing.revoked || existing.expiresAt < new Date()) {
            throw new Error("Invalid refresh token!");
        }
        // revoke old token
        await tx.refreshToken.update({
            where: { tokenHash: oldTokenHash },
            data: {
                revoked: true,
                replacedBy: newTokenHash,
            },
        });
        // insert new token
        await tx.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userId,
                expiresAt,
            },
        });
    });
}
// if a revoked token is reused!
async function detectReplay(tokenHash) {
    const token = await prisma_1.prisma.refreshToken.findUnique({
        where: { tokenHash },
    });
    if (token?.revoked) {
        // todo: Revoke all user refresh tokens
        // todo: Force logout on all devices!!! Messages in Browser Broadcast Channel.
        return token.userId;
    }
    return null;
}
// logout logic
async function revokeRefreshToken(tokenHash) {
    await prisma_1.prisma.refreshToken.updateMany({
        // update many won't throw if we run this function on already revoked token
        where: {
            tokenHash,
            revoked: false,
        },
        data: {
            revoked: true,
        },
    });
}
async function revokeAllUserRefreshTokens(userId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: {
            userId,
            revoked: false,
        },
        data: {
            revoked: true,
        },
    });
}
// daily CRON job, cleanup unused TOKENS
async function cleanupExpiredRefreshTokens() {
    await prisma_1.prisma.refreshToken.deleteMany({
        where: {
            expiresAt: {
                lt: new Date(),
            },
        },
    });
}
function setExpiresInDays(days) {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * days);
}
