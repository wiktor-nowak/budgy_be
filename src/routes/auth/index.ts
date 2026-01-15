import express, { Router } from "express";
import { loginHandler, logoutHandler, refreshHandler } from "./auth";

const auth: Router = express.Router();

auth.post("/refresh", refreshHandler);
auth.post("/login", loginHandler);
auth.post("/logout", logoutHandler);

export default auth;
