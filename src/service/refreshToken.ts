import crypto from "crypto";

export function generateOpaqueToken(bytes: number = 64) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("base64url");
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}
