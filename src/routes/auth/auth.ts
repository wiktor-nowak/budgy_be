import { Response, Request } from "express";

import {
  createRefreshTokenRecord,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_OPTIONS,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  setExpiresInDays,
  validateRefreshToken,
} from "../../service/refreshTokenService";
import { signAccessToken } from "../../service/accessTokenService";
import { parseLoginRequest } from "../../service/credentialsService";
import { validateUserCredentials } from "../../service/usersService";
import AuthenticationError from "../../errors/AuthenticationError";

export async function loginHandler(req: Request, res: Response) {
  const credentials = parseLoginRequest(req.body);
  const userId = await validateUserCredentials(credentials);
  const accessToken = signAccessToken({
    id: userId,
  });
  const refreshToken = generateRefreshToken();
  await createRefreshTokenRecord(
    hashRefreshToken(refreshToken),
    userId,
    setExpiresInDays(30),
  );

  res.cookie("refresh_token", refreshToken, REFRESH_TOKEN_OPTIONS);
  res.status(200).send({
    message: `User successfully logged in!`,
    accessToken: accessToken,
  });
}

export async function logoutHandler(req: Request, res: Response) {
  const rawToken = req.cookies?.refresh_token;
  if (rawToken) {
    await revokeRefreshToken(hashRefreshToken(rawToken));
  }
  res.clearCookie("refresh_token", REFRESH_TOKEN_OPTIONS);
  res.sendStatus(204);
}

export async function refreshHandler(req: Request, res: Response) {
  const rawToken = req.cookies.refresh_token;
  if (!rawToken) throw new AuthenticationError();
  const hashedToken = hashRefreshToken(rawToken);
  const existingRefreshToken = await validateRefreshToken(hashedToken);
  if (!existingRefreshToken) throw new AuthenticationError();

  const newRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

  try {
    await rotateRefreshToken(
      hashedToken,
      newHashedRefreshToken,
      existingRefreshToken.userId,
      setExpiresInDays(30),
    );
  } catch (error) {
    await revokeAllUserRefreshTokens(existingRefreshToken.userId);
    throw new AuthenticationError("Session invalidated");
  }

  const accessToken = signAccessToken({
    id: existingRefreshToken.userId,
  });

  res.cookie("refresh_token", newRefreshToken, REFRESH_TOKEN_OPTIONS);

  return res.status(200).send({
    message: `User successfully authenticated!`,
    accessToken: accessToken,
  });
}
