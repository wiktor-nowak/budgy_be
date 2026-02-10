import { Response, Request } from "express";

import refreshTokenService from "../../services/refreshToken";
import accessTokenService from "../../services/accessToken";
import credentialsService from "../../services/credentials";
import usersService from "../../services/users";
import AuthenticationError from "../../errors/AuthenticationError";

export async function loginHandler(req: Request, res: Response) {
  const credentials = credentialsService.parseLoginRequest(req.body);
  const userId = await usersService.validateCredentials(credentials);
  const accessToken = accessTokenService.signAccessToken({
    id: userId,
  });
  const refreshToken = refreshTokenService.generate();
  await refreshTokenService.createRecord(
    refreshTokenService.hash(refreshToken),
    userId,
    refreshTokenService.expiresInDays(30),
  );

  res.cookie(
    "refresh_token",
    refreshToken,
    refreshTokenService.REFRESH_TOKEN_OPTIONS,
  );
  res.status(200).send({
    message: `User successfully logged in!`,
    accessToken: accessToken,
  });
}

export async function logoutHandler(req: Request, res: Response) {
  const rawToken = req.cookies?.refresh_token;
  if (rawToken) {
    await refreshTokenService.revoke(refreshTokenService.hash(rawToken));
  }
  res.clearCookie("refresh_token", refreshTokenService.REFRESH_TOKEN_OPTIONS);
  res.sendStatus(204);
}

export async function refreshHandler(req: Request, res: Response) {
  const rawToken = req.cookies.refresh_token;
  if (!rawToken) throw new AuthenticationError();
  const hashedToken = refreshTokenService.hash(rawToken);
  const existingRefreshToken = await refreshTokenService.validate(hashedToken);
  if (!existingRefreshToken) throw new AuthenticationError();

  const newRefreshToken = refreshTokenService.generate();
  const newHashedRefreshToken = refreshTokenService.hash(newRefreshToken);

  try {
    await refreshTokenService.rotate(
      hashedToken,
      newHashedRefreshToken,
      existingRefreshToken.userId,
      refreshTokenService.expiresInDays(30),
    );
  } catch (error) {
    await refreshTokenService.revokeAll(existingRefreshToken.userId);
    throw new AuthenticationError("Session invalidated");
  }

  const accessToken = accessTokenService.signAccessToken({
    id: existingRefreshToken.userId,
  });

  res.cookie(
    "refresh_token",
    newRefreshToken,
    refreshTokenService.REFRESH_TOKEN_OPTIONS,
  );

  return res.status(200).send({
    message: `User successfully authenticated!`,
    accessToken: accessToken,
  });
}
