import crypto from "crypto";
import bcrypt from "bcrypt";
import GeneralErrror from "../errors/GeneralError";
import { prisma } from "../lib/db/prisma";
import AuthenticationError from "../errors/AuthenticationError";
import ResourceNotFoundError from "../errors/ResourceNotFoundError";
import utilityServices from "./utility";
import { User } from "../prisma/generated/client";
import { TransactionClient } from "../prisma/generated/internal/prismaNamespace";
import { mailer } from "../lib/emails/mailer";
import { verifyEmailTemplate } from "../lib/emails/verifyEmail";

async function createEmailVerificationToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(rawToken, 10);

  return { rawToken, tokenHash };
}

async function verifyEmail(token: string) {
  if (!token) throw new GeneralErrror("Invalid link.");
  const records = await prisma.emailVerificationToken.findMany({
    where: { expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  const match = await Promise.all(
    records.map(async (r) => ({
      record: r,
      isValid: await bcrypt.compare(token, r.tokenHash),
    })),
  ).then((results) => results.find((r) => r.isValid));

  if (!match) throw new AuthenticationError("Token expired.");
  await prisma.$transaction([
    prisma.user.update({
      where: { id: match.record.userId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    }),
    prisma.emailVerificationToken.delete({
      where: { id: match.record.id },
    }),
  ]);
  return match;
}

async function verificationEmailTokensCleanup() {
  await prisma.emailVerificationToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

async function regenerateToken(email: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { email },
    });
    if (!user) throw new ResourceNotFoundError("Invalid credentials.");
    await tx.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });
    await sendVeryficationEmail(user, tx as TransactionClient);
  });
}

async function sendVeryficationEmail(user: User, tx: TransactionClient) {
  const { rawToken, tokenHash } = await createEmailVerificationToken();
  await tx.emailVerificationToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: utilityServices.expiresInDays(1),
    },
  });
  const link = `http://localhost:${process.env.PORT}/auth/verify-email?token=${rawToken}`;

  await mailer.sendMail({
    to: user.email,
    subject: "Verify your email",
    html: verifyEmailTemplate(link),
  });
  return tx;
}

export default {
  createEmailVerificationToken,
  regenerateToken,
  verifyEmail,
  verificationEmailTokensCleanup,
  sendVeryficationEmail,
};
