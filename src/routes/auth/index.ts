import express, { Router } from "express";
import { authMiddleware } from "../../middleware/authentication";
import { check } from "./auth";

const auth: Router = express.Router();

auth.post("/", authMiddleware, check);

export default auth;
