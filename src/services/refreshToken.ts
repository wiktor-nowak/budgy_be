import crypto from "crypto";
import { prisma } from "../lib/db/prisma";
import { CookieOptions } from "express";

const REFRESH_TOKEN_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

// used in cookie
function generate(bytes: number = 64) {
  return crypto.randomBytes(bytes).toString("base64url");
}

// goes to DB
function hash(token: string): string {
  return crypto.createHash("sha256").update(token).digest("base64url");
}

async function createRecord(
  tokenHash: string,
  userId: string,
  expiresAt: Date,
) {
  const created = await prisma.refreshToken.create({
    data: { tokenHash, userId, expiresAt },
  });
  return created;
}

async function validate(tokenHash: string) {
  const token = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (!token) return null;
  if (token.revoked) return null;
  if (token.expiresAt < new Date()) return null;

  return token;
}

async function rotate(
  oldTokenHash: string,
  newTokenHash: string,
  userId: string,
  expiresAt: Date,
) {
  return prisma.$transaction(async (tx) => {
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
async function detectReplay(tokenHash: string) {
  const token = await prisma.refreshToken.findUnique({
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

async function revoke(tokenHash: string) {
  await prisma.refreshToken.updateMany({
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

async function revokeAll(userId: string) {
  await prisma.refreshToken.updateMany({
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
async function cleanupExpired() {
  await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
}

export default {
  createRecord,
  cleanupExpired,
  detectReplay,
  generate,
  hash,
  REFRESH_TOKEN_OPTIONS,
  revokeAll,
  revoke,
  rotate,
  validate,
};
