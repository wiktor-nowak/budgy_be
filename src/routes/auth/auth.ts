import { Response, Request } from "express";

import {
  createRefreshTokenRecord,
  generateRefreshToken,
  hashRefreshToken,
  revokeAllUserRefreshTokens,
  revokeRefreshToken,
  rotateRefreshToken,
  setExpiresInDays,
  validateRefreshToken,
} from "../../service/refreshToken";
import { signAccessToken } from "../../service/accessToken";
import { parseLoginRequest } from "../../service/credentials";
import { LoginCredentials } from "../../types/credentials";
import { validateUserCredentials } from "../users/users";

export async function loginHandler(req: Request, res: Response) {
  try {
    const credentials: LoginCredentials = parseLoginRequest(req.body);
    const validatedUserId = await validateUserCredentials(credentials);

    // issue new access token
    const accessToken = signAccessToken({
      sub: validatedUserId,
    });

    //generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);
    const x = await createRefreshTokenRecord(
      newHashedRefreshToken,
      validatedUserId,
      setExpiresInDays(30),
    );

    console.log(x);

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
  } catch (error) {
    res.status(500).send({ error: error, info: "WTF" });
  }
}

export async function logoutHandler(req: Request, res: Response) {
  const rawToken = req.cookies?.refresh_token;
  if (!rawToken) {
    return res.sendStatus(401); // add sending message!
  }
  const tokenHash = hashRefreshToken(rawToken);
  revokeRefreshToken(tokenHash);
  res.clearCookie("refresh_token", {
    httpOnly: true,
    // secure: true // set while on server
    sameSite: "lax",
    path: "/auth/refresh",
  });
}

export async function refreshHandler(req: Request, res: Response) {
  console.log(req.cookies);
  const rawToken = req.cookies?.refresh_token;
  console.log(rawToken);
  if (!rawToken) {
    return res.sendStatus(401); // add sending message!
  }
  const tokenHash = hashRefreshToken(rawToken);
  const existing = await validateRefreshToken(tokenHash);
  if (!existing) {
    return res.sendStatus(401);
  }

  //generate new refresh token
  const newRefreshToken = generateRefreshToken();
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

  try {
    await rotateRefreshToken(
      tokenHash,
      newHashedRefreshToken,
      existing.userId,
      setExpiresInDays(30),
    );
  } catch (error) {
    await revokeAllUserRefreshTokens(existing.userId);
    return res.sendStatus(401);
  }

  // issue new access token
  const accessToken = signAccessToken({
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
