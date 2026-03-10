import express, { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  verifyEmail,
  reVerifyEmail,
} from "./auth";

const auth: Router = express.Router();

auth.post("/refresh", refreshHandler);
auth.post("/login", loginHandler);
auth.post("/logout", logoutHandler);
auth.get("/verify-email", verifyEmail);
auth.post("/verify-email", reVerifyEmail);

export default auth;
