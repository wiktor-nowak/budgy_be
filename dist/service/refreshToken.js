import crypto from "crypto";
export function generateOpaqueToken(bytes = 64) {
    return crypto.randomBytes(bytes).toString("base64url");
}
export function hashOpaqueToken(token) {
    return crypto.createHash("sha256").update(token).digest("base64url");
}
export function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
}
