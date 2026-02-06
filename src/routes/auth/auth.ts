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
      id: validatedUserId,
    });

    //generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);
    await createRefreshTokenRecord(
      newHashedRefreshToken,
      validatedUserId,
      setExpiresInDays(30),
    );

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      // secure: true // set while on server
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.status(200).send({
      message: `User successfully logged in!`,
      accessToken: accessToken,
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
    path: "/",
  });
}

export async function refreshHandler(req: Request, res: Response) {
  const rawToken = req.cookies.refresh_token;
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
    id: existing.userId,
  });

  // set new refresh cookie
  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    // secure: true // set while on server
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).send({
    message: `User successfully authenticated!`,
    accessToken: accessToken,
  });
}
